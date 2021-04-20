import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { remediate } from './remediate';
import { 
  OktaAuth,
  IdxOptions,
  RunOptions,
  IdxTransactionMeta,
  RemediationValues
} from '../types';
import { AuthSdkError } from 'lib/errors';

export async function run(authClient: OktaAuth, options: RunOptions & IdxOptions) {
  const { needInteraction, flow, action } = options;
  let tokens;
  let nextStep;
  let interactionHandle;
  let error;
  let status;

  try {
    // Start/resume the flow
    let { idxResponse, stateHandle } = await interact(authClient, options);

    // Call action if provided
    if (action && typeof idxResponse.actions[action] === 'function') {
      idxResponse = await idxResponse.actions[action]();
    }

    const values: RemediationValues = { ...options, stateHandle };

    // Can we handle the remediations?
    const { 
      idxResponse: { 
        interactionCode,
        toPersist: {
          interactionHandle: interactionHandleFromResp,
        },
      }, 
      nextStep: nextStepFromResp
    } = await remediate(idxResponse, flow, values);
    interactionHandle = interactionHandleFromResp;
    nextStep = nextStepFromResp;

    // Did we get an interaction code?
    status = needInteraction ? 'PENDING' : 'FAILED';
    if (interactionCode) {
      const meta = authClient.transactionManager.load() as IdxTransactionMeta;
      const {
        codeVerifier,
        clientId,
        redirectUri,
        scopes,
        urls,
        ignoreSignature
      } = meta;

      tokens = await authClient.token.exchangeCodeForTokens({
        interactionCode,
        codeVerifier,
        clientId,
        redirectUri,
        scopes,
        ignoreSignature
      }, urls);
      status = 'SUCCESS';
    }
  } catch (err) {
    status = 'FAILED';
    error = err;
    if (error instanceof AuthSdkError) {
      // AuthApiError can be resolved by client side retry
      // Clear transaction meta when error is not handlable (AuthSdkError)
      authClient.transactionManager.clear();
    }
  }
  
  const authTransaction = new AuthTransaction(authClient, {
    interactionHandle,
    tokens: tokens ? tokens.tokens : null,
    status,
    nextStep,
    error,
  });
  return authTransaction;
}