
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

import AuthApiError from './AuthApiError';
import AuthPollStopError from './AuthPollStopError';
import AuthSdkError from './AuthSdkError';
import OAuthError from './OAuthError';
import WWWAuthError from './WWWAuthError';

function isAuthApiError(obj: any): obj is AuthApiError {
  return (obj instanceof AuthApiError);
}

function isOAuthError(obj: any): obj is OAuthError {
  return (obj instanceof OAuthError);
}

function isWWWAuthError(obj: any): obj is WWWAuthError {
  return (obj instanceof WWWAuthError);
}

export {
  isAuthApiError,
  isOAuthError,
  isWWWAuthError,
  AuthApiError,
  AuthPollStopError,
  AuthSdkError,
  OAuthError,
  WWWAuthError
};

export * from './types';
