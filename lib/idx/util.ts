import { AuthApiError } from '../errors';
import { APIError } from '../types';

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