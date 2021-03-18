/* eslint-disable complexity */
import { AuthApiError } from '../errors';
import { AuthTransaction } from '../tx';
import { OktaAuth, AuthorizeOptions, IdxResponse, isRawIdxResponse, APIError, IdxTransactionMeta } from '../types';
import { interact } from './interact';
import { introspect } from './introspect';

function createApiError(res): APIError {
  console.log('CREATE API ERROR: ', JSON.stringify(res.messages, null, 2));
  let allErrors = [];

  if (res.messages && Array.isArray(res.messages.value)) {
    allErrors = res.messages.value.map(o => o.message);
  }

  return new AuthApiError({
    errorSummary: allErrors.join('. '),
    errorCauses: allErrors
  });
}

function canSatisfyRemediation(options: AuthorizeOptions, idxResponse: IdxResponse) {
  const { username, password } = options;
  const { neededToProceed } = idxResponse;
  if (neededToProceed.length !== 1) {
    return false;
  }

  const form = neededToProceed[0];
  if (form.name === 'identify') {
    if (username && form.value.find(el => el.name === 'identifier')) {
      return true;
    }
    if (password && form.value.find(el => el.name === 'credentials')) {
      return true;
    }
  }

  if (form.name === 'challenge-authenticator') {
    if (password && form.value.find(el => el.name === 'credentials')) {
      return true;
    }
  }

  return false;
}

async function satisfyRemediations(
  authClient: OktaAuth,
  options: AuthorizeOptions,
  idxResponse: IdxResponse,
  stateHandle: string
) {
  // Recursive loop breaker
  if (!canSatisfyRemediation(options, idxResponse)) {
    console.log('REMEDIATION CANNOT BE SATISIFIED', idxResponse);
    return idxResponse;
  }

  const { username, password } = options;
  const { neededToProceed } = idxResponse;

  const form = neededToProceed[0];
  const data = { stateHandle, identifier: undefined, credentials: undefined };
  if (form.value.find(el => el.name === 'identifier')) {
    data.identifier = username;
  }
  if (form.value.find(el => el.name === 'credentials')) {
    data.credentials = { passcode: password };
  }
  console.log('PASSING DATA to proceed: ', data);
  try {
    idxResponse = await idxResponse.proceed(form.name, data);
    return satisfyRemediations(authClient, options, idxResponse, stateHandle); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown
      throw createApiError(e);
    }
    throw e;
  }
}

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
  idxResponse = await satisfyRemediations(authClient, options, idxResponse, stateHandle);

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
