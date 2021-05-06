/* eslint-disable max-statements, max-depth */
import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { remediate } from './remediate';
import LoopMonitor from './RemediationLoopMonitor';
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
  allowedNextSteps: string[];
  actions?: string[];
}

export async function run(
  authClient: OktaAuth, 
  options: RunOptions & IdxOptions,
) {
  let tokens;
  let nextStep;
  let terminal;
  let error;
  let status: IdxStatus;

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
      formError,
      terminal: terminalFromResp,
    } = await remediate(idxResponse, values, new LoopMonitor(), options);

    // Track fields from remediation response
    nextStep = nextStepFromResp;
    terminal = terminalFromResp;
    error = formError;

    // Track should terminate
    shouldTerminate = shouldTerminate || !!terminal;

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
    shouldTerminate = true;
  }

  if (shouldTerminate) {
    authClient.transactionManager.clear();
  }
  
  const authTransaction = new AuthTransaction(authClient, {
    tokens: tokens ? tokens.tokens : null,
    status,
    nextStep,
    terminal,
    error,
  });
  return authTransaction;
}