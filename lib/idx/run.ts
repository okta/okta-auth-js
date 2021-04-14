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

// TODO: throw unsupported flow error
export async function run(authClient: OktaAuth, options: RunOptions & IdxOptions) {
  const { needInteraction, flow, actionPath } = options;

  // Start/resume the flow
  let { idxResponse, stateHandle } = await interact(authClient, options);

  // Call action if provided
  if (actionPath && typeof idxResponse.actions[actionPath] === 'function') {
    idxResponse = await idxResponse.actions[actionPath]();
  }

  const values: RemediationValues = { ...options, stateHandle };

  // Can we handle the remediations?
  idxResponse = await remediate(idxResponse, flow, values);

  // Did we get an interaction code?
  let status = needInteraction ? 'PENDING' : 'FAILED';
  let tokens;
  if (idxResponse.interactionCode) {
    const { interactionCode } = idxResponse;
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

    // Clear transaction meta after getting the tokens
    authClient.transactionManager.clear();
  }

  const authTransaction = new AuthTransaction(authClient, {
    stateHandle: idxResponse.rawIdxState.stateHandle,
    tokens,
    status
  });
  return authTransaction;
}