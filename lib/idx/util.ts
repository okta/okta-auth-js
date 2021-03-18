import { AuthApiError } from '../errors';
import { APIError, IdxRemediation, IdxResponse } from '../types';

export function createApiError(res): APIError {
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

export function isErrorResponse(idxResponse: IdxResponse) {
  const rawIdxState = idxResponse.rawIdxState;
  if (rawIdxState.messages && rawIdxState.messages.value && rawIdxState.messages.value.length > 0) {
    return true;
  }
  return false;
}
