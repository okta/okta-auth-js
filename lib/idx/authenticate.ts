/* eslint-disable complexity */
import { AuthTransaction } from '../tx';
import { OktaAuth, AuthorizeOptions, IdxTransactionMeta } from '../types';
import { interact } from './interact';
import { introspect } from './introspect';
import { remediate } from './remediate';

export async function authenticate(authClient: OktaAuth, options: AuthorizeOptions): Promise<AuthTransaction> {
  let { state, scopes, interactionHandle } = options;

  if (interactionHandle) {
    // resume existing transaction, not supported yet
    throw new Error('Unexpectedly found a saved interaction handle. Check storageManager config');
  }

  const interactResponse = await interact(authClient, { state, scopes, interactionHandle });
  const { stateHandle } = interactResponse;
  if (!interactionHandle) {
    interactionHandle = interactResponse.interactionHandle;
  }

  let idxResponse = await introspect(authClient, { stateHandle });

  // Can we handle the remediations?
  idxResponse = await remediate(authClient, options, idxResponse, stateHandle);

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

    console.log('META', meta);
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

  const authTransaction = new AuthTransaction(authClient, {
    interactionHandle,
    idxResponse,
    tokens,
    status
  });
  return authTransaction;
}
