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
// TODO: clear transaction meta when unhandlable error is thrown
export async function run(authClient: OktaAuth, options: RunOptions & IdxOptions) {
  const { needInteraction, flow, action } = options;

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
        interactionHandle,
      },
    }, 
    nextStep 
  } = await remediate(idxResponse, flow, values);

  // Did we get an interaction code?
  let status = needInteraction ? 'PENDING' : 'FAILED';
  let tokens;
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

  // TODO: return error
  const authTransaction = new AuthTransaction(authClient, {
    interactionHandle,
    tokens: tokens ? tokens.tokens : null,
    status,
    nextStep,
  });
  return authTransaction;
}