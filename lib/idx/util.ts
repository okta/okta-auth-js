import { AuthApiError } from '../errors';
import { APIError, IdxRemediation, IdxResponse } from '../types';

export function createApiError(res): APIError {
  let allErrors = [];

  console.log('creating api error', res);

  if (res.messages && Array.isArray(res.messages.value)) {
    allErrors = res.messages.value.map(o => o.message);
  }

  return new AuthApiError({
    errorSummary: allErrors.join('. '),
    errorCauses: allErrors
  });
}

export function getAllValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value.map(r => r.name);
}

export function getRequiredValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value.reduce((required, cur) => {
    if (cur.required) {
      required.push(cur.name);
    }
    return required;
  }, []);
}

export function findRemediationByName(idxRemediation: IdxRemediation, name: string) {
  return idxRemediation.value.find((value) => {
    if (value.name === name) {
      return true;
    }
  });
}

// Return first match idxRemediation in allowed remediators
export function getIdxRemediation(remediators, idxRemediations) {
  return idxRemediations.find(idxRemediation => Object.keys(remediators).includes(idxRemediation.name));
}

export function isErrorResponse(idxResponse: IdxResponse) {
  const rawIdxState = idxResponse.rawIdxState;
  if (rawIdxState.messages && rawIdxState.messages.value && rawIdxState.messages.value.length > 0) {
    return true;
  }
  return false;
}

export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
