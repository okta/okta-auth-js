import { isAuthApiError } from '../../errors';

export function isRefreshTokenError(err: Error) {
  if (!isAuthApiError(err)) {
    return false;
  }

  if (!err.xhr || !err.xhr.responseJSON) {
    return false;
  }

  const { responseJSON } = err.xhr;
  if (responseJSON.error === 'invalid_grant') {
    return true;
  }

  return false;
}