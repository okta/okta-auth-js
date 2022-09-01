/* eslint-disable complexity */

import { AuthSdkError } from '../../errors';
import { isAccessToken, isIDToken, isRefreshToken, Token, TokenType } from '../../oidc/types';

export function validateToken(token: Token, type?: TokenType) {
  if (!isIDToken(token) && !isAccessToken(token) && !isRefreshToken(token)) {
    throw new AuthSdkError(
      'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
    );
  }
  
  if (type === 'accessToken' && !isAccessToken(token)) {
    throw new AuthSdkError('invalid accessToken');
  } 
  if (type === 'idToken' && !isIDToken(token)) {
    throw new AuthSdkError('invalid idToken');
  }

  if (type === 'refreshToken' && !isRefreshToken(token)) {
    throw new AuthSdkError('invalid refreshToken');
  }
}