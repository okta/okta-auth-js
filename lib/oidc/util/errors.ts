/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { OktaAuthOAuthInterface } from '../types';
import { OAuthError, AuthApiError, isOAuthError } from '../../errors';

export function isInteractionRequiredError(error: Error) {
  if (error.name !== 'OAuthError') {
    return false;
  }
  const oauthError = error as OAuthError;
  return (oauthError.errorCode === 'interaction_required');
}

export function isAuthorizationCodeError(sdk: OktaAuthOAuthInterface, error: Error) {
  if (error.name !== 'AuthApiError') {
    return false;
  }
  const authApiError = error as AuthApiError;
  // xhr property doesn't seem to match XMLHttpRequest type
  const errorResponse = authApiError.xhr as unknown as Record<string, unknown>;
  const responseJSON = errorResponse?.responseJSON as Record<string, unknown>;
  return sdk.options.pkce && (responseJSON?.error as string === 'invalid_grant');
}

export function isRefreshTokenInvalidError(error: unknown): boolean {
  // error: {"error":"invalid_grant","error_description":"The refresh token is invalid or expired."}
  return isOAuthError(error) &&
    error.errorCode === 'invalid_grant' &&
    error.errorSummary === 'The refresh token is invalid or expired.';
}
