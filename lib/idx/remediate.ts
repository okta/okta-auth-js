/* eslint-disable complexity */
import { OktaAuth, AuthorizeOptions, IdxResponse, isRawIdxResponse } from '../types';
import { createApiError } from './util';


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

export async function remediate(
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
    return remediate(authClient, options, idxResponse, stateHandle); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown
      throw createApiError(e);
    }
    throw e;
  }
}
