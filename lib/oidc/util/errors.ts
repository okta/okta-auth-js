import { OAuthError } from '../../errors';

export function isInteractionRequiredError(error: Error) {
  if (error.name !== 'OAuthError') {
    return false;
  } 
  const oauthError = error as OAuthError;
  return (oauthError.errorCode === 'interaction_required');
}
