/* eslint-disable complexity */
import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  AuthorizeOptions, 
  IdxTransactionMeta, 
  RemediationValues,
  RemediatorFlow
} from '../types';
import { interact } from './interact';
import { remediate } from './remediate';

export async function authenticate(authClient: OktaAuth, options: AuthorizeOptions): Promise<AuthTransaction> {
  let { state, scopes, interactionHandle } = options;

  if (interactionHandle) {
    // resume existing transaction, not supported yet
    throw new Error('Unexpectedly found a saved interaction handle. Check storageManager config');
  }

  const interactResponse = await interact(authClient, { state, scopes, interactionHandle });
  let { stateHandle, idxResponse } = interactResponse;
  if (!interactionHandle) {
    interactionHandle = interactResponse.interactionHandle;
  }

  const values: RemediationValues = Object.assign({}, options, {
    stateHandle
  });

  // Can we handle the remediations?
  idxResponse = await remediate(idxResponse, RemediatorFlow.Authenticate, values);

  // Did we get an interaction code?
  let status = 'FAILURE';
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
    interactionHandle,
    idxResponse,
    tokens,
    status
  });
  return authTransaction;
}
