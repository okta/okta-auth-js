import { OktaAuth } from '../../types';
import { OAuthError, AuthApiError } from '../../errors';

export function isInteractionRequiredError(error: Error) {
  if (error.name !== 'OAuthError') {
    return false;
  }
  const oauthError = error as OAuthError;
  return (oauthError.errorCode === 'interaction_required');
}

export function isAuthorizationCodeError(sdk: OktaAuth, error: Error) {
  if (error.name !== 'AuthApiError') {
    return false;
  }
  const authApiError = error as AuthApiError;
  // xhr property doesn't seem to match XMLHttpRequest type
  const errorResponse = authApiError.xhr as unknown as Record<string, unknown>;
  const responseJSON = errorResponse?.responseJSON as Record<string, unknown>;
  return sdk.options.pkce && (responseJSON?.error as string === 'invalid_grant');
}
