import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { remediate } from './remediate';
import { 
  OktaAuth,
  IdxOptions,
  IdxTransactionMeta,
  RemediationValues,
  RemediationFlow,
  IdxStatus,
} from '../types';

export interface RunOptions {
  flow: RemediationFlow;
  action?: string;
}

export async function run(authClient: OktaAuth, options: RunOptions & IdxOptions) {
  const { flow, action } = options;
  let tokens;
  let nextStep;
  let interactionHandle;
  let error;
  let status: IdxStatus;

  try {
    // Start/resume the flow
    let { idxResponse, stateHandle } = await interact(authClient, options);
    interactionHandle = idxResponse.toPersist.interactionHandle;

    // Call action if provided
    if (action && typeof idxResponse.actions[action] === 'function') {
      idxResponse = await idxResponse.actions[action]();
    }

    const values: RemediationValues = { ...options, stateHandle };

    // Can we handle the remediations?
    const { 
      idxResponse: { 
        interactionCode,
      } = {}, 
      nextStep: nextStepFromResp,
      formError,
    } = await remediate(idxResponse, flow, values);

    // Track nextStep and formError
    nextStep = nextStepFromResp;
    error = formError;

    // Did we get an interaction code?
    status = IdxStatus.PENDING;
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
      status = IdxStatus.SUCCESS;
    }
  } catch (err) {
    error = err;
    status = IdxStatus.FAILED;
    // Clear transaction meta when error is not handlable
    authClient.transactionManager.clear();
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