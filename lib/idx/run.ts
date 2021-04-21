import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { remediate } from './remediate';
import { 
  OktaAuth,
  IdxOptions,
  IdxTransactionMeta,
  RemediationValues,
  RemediationFlow,
} from '../types';

export interface RunOptions {
  flow: RemediationFlow;
  needInteraction: boolean;
  action?: string;
}

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
      }, 
      nextStep: nextStepFromResp
    } = await remediate(idxResponse, flow, values);
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
    error = err;
    status = 'FAILED';
    // Clear transaction meta when error is not handlable
    // TODO: probably need to handle error differently based on it's idx top level error or form error
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