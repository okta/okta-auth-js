import { AuthApiError } from '../errors';
import { APIError, IdxRemediation, IdxResponse } from '../types';

export function createApiError(res): APIError {
  let allErrors = [];
  let errorCode;

  if (res.messages && Array.isArray(res.messages.value)) {
    allErrors = res.messages.value.map(o => o.message);
    errorCode = res.messages.value.reduce((acc, curr) => {
      return acc 
        ? acc + ',' + curr.i18n?.key 
        : curr.i18n?.key;
    }, '');
  }

  return new AuthApiError({
    errorCode,
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

export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function canSkip(idxResponse: IdxResponse) {
  return idxResponse.neededToProceed.some(({ name }) => name === 'skip');
}
