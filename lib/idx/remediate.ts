/* eslint-disable max-statements */
/* eslint-disable complexity */
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationValues,
  RemediatorFlow
} from '../types';
import { 
  createApiError, 
  isErrorResponse, 
  getIdxRemediation 
} from './util';
import {
  Identify,
  EnrollOrChallengeAuthenticator,
  SelectEnrollProfile,
  EnrollProfile,
  SelectAuthenticator,
} from './remediators';

const REMEDIATORS = {
  [RemediatorFlow.Authentication]: {
    'identify': Identify,
    'challenge-authenticator': EnrollOrChallengeAuthenticator,
  },
  [RemediatorFlow.Registration]: {
    'select-enroll-profile': SelectEnrollProfile,
    'enroll-profile': EnrollProfile,
    'select-authenticator-enroll': SelectAuthenticator,
    'enroll-authenticator': EnrollOrChallengeAuthenticator,
  },
  [RemediatorFlow.PasswordRecovery]: {
    'identify-recovery': Identify,
    'select-authenticator-authenticate': SelectAuthenticator,
    'challenge-authenticator': EnrollOrChallengeAuthenticator,
    'reset-authenticator': EnrollOrChallengeAuthenticator,
  },
  // add more
};

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  flow: RemediatorFlow,
  values: RemediationValues
) {
  const { neededToProceed } = idxResponse;
  const idxRemediation = getIdxRemediation(REMEDIATORS[flow], neededToProceed);
  const name = idxRemediation.name;
  const T = REMEDIATORS[flow][name];
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
    return remediate(idxResponse, flow, values); // recursive call
  } catch (e) {
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown, these will be "raw"
      if (e.messages) {
        throw createApiError(e);
      } else {
        throw remediator.createApiError(e);
      }
    }
    throw e;
  }
}
