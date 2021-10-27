import { isAuthApiError } from '../../errors';
export function isSameRefreshToken(a, b) {
  return a.refreshToken === b.refreshToken;
}
export function isRefreshTokenError(err) {
  if (!isAuthApiError(err)) {
    return false;
  }

  if (!err.xhr || !err.xhr.responseJSON) {
    return false;
  }

  var {
    responseJSON
  } = err.xhr;

  if (responseJSON.error === 'invalid_grant') {
    return true;
  }

  return false;
}
//# sourceMappingURL=refreshToken.js.map