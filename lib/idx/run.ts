/* eslint-disable max-statements */
import { interact } from './interact';
import { remediate } from './remediate';
import { FlowMonitor } from './flowMonitors';
import { 
  OktaAuth,
  IdxOptions,
  IdxTransactionMeta,
  RemediationValues,
  RemediationFlow,
  IdxStatus,
  IdxTransaction,
} from '../types';

export interface RunOptions {
  flow: RemediationFlow;
  actions?: string[];
  flowMonitor: FlowMonitor;
}

export async function run(
  authClient: OktaAuth, 
  options: RunOptions & IdxOptions,
): Promise<IdxTransaction> {
  let tokens;
  let nextStep;
  let messages;
  let error;
  let status = IdxStatus.PENDING;
  let shouldTerminate = false;

  try {
    // Start/resume the flow
    let { idxResponse, stateHandle } = await interact(authClient, options); 

    const values: RemediationValues = { ...options, stateHandle };

    // Can we handle the remediations?
    const { 
      idxResponse: { 
        interactionCode,
      } = {}, 
      nextStep: nextStepFromResp,
      terminal,
      messages: messagesFromResp,
    } = await remediate(idxResponse, values, options);

    // Track fields from remediation response
    nextStep = nextStepFromResp;
    messages = messagesFromResp;

    if (terminal) {
      status = IdxStatus.TERMINAL;
      shouldTerminate = true;
    } else if (interactionCode) { 
      // Did we get an interaction code?
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
      shouldTerminate = true;
    }
  } catch (err) {
    error = err;
    status = IdxStatus.FAILURE;
    shouldTerminate = true;
  }

  if (shouldTerminate) {
    authClient.transactionManager.clear();
  }
  
  return {
    tokens: tokens ? tokens.tokens : null,
    status,
    nextStep,
    messages,
    error,
  };
}
