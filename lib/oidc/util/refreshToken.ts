import { RefreshToken, OktaAuth } from '../../types';
import { isAuthApiError } from '../../errors';
import { REFRESH_TOKEN_STORAGE_KEY } from '../../constants';

export function updateRefreshToken(sdk: OktaAuth, refreshToken: RefreshToken) {
  const refreshTokenKey = sdk.tokenManager.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY;
  sdk.tokenManager.add(refreshTokenKey, refreshToken);
}

export function getRefreshToken(sdk: OktaAuth) {
  const tokens = sdk.tokenManager.getTokensSync();
  return tokens.refreshToken;
}

export function hasRefreshToken(sdk: OktaAuth) {
  return !!getRefreshToken(sdk);
}


export function isSameRefreshToken(a: RefreshToken, b: RefreshToken) {
  return (a.refreshToken === b.refreshToken);
}

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