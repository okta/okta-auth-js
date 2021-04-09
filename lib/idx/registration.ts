import { AuthTransaction } from '../tx';
import { introspect } from './introspect';
import { interact } from './interact';
import { remediate } from './remediate';
import { 
  OktaAuth, 
  AuthorizeOptions, 
  IdxTransactionMeta, 
  RemediationValues, 
  RemediatorFlow 
} from '../types';


export async function registration(authClient: OktaAuth, options) {
  let { idxResponse, stateHandle } = await interact(authClient, options);
  const values: RemediationValues = { ...options, stateHandle };

  idxResponse = await remediate(idxResponse, RemediatorFlow.Registration, values);

  // Did we get an interaction code?
  let status = 'PENDING';
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
};
