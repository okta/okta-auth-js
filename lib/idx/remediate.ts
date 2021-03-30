/* eslint-disable max-statements */
/* eslint-disable complexity */
import { IdxResponse, isRawIdxResponse, RemediationValues } from '../types';
import { createApiError, isErrorResponse } from './util';
import Identify from './remediatiors/Identify';
import ChallengeAuthenticator from './remediatiors/ChallengeAuthenticator';

const REMEDIATORS = {
  'identify': Identify,
  'challenge-authenticator': ChallengeAuthenticator
  // add more
};

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues
) {
  const { neededToProceed } = idxResponse;
  const idxRemediation = neededToProceed[0];
  const name = idxRemediation.name;
  const T = REMEDIATORS[name];
  if (!T) {
    // No remediator is registered. bail!
    return idxResponse;
  }
  const remediator = new T(idxRemediation, values);

  // Recursive loop breaker
  if (!remediator.canRemediate()) {
    return idxResponse;
  }

  const data = remediator.getData();
  try {
    idxResponse = await idxResponse.proceed(idxRemediation.name, data);
    if (isErrorResponse(idxResponse)) {
      throw createApiError(idxResponse.rawIdxState);
    }
    if (idxResponse.interactionCode) {
      return idxResponse;
    }
    return remediate(idxResponse, values); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown, these will be "raw"
      throw createApiError(e);
    }
    throw e;
  }
}
