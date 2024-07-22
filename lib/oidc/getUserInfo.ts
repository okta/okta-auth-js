/* eslint-disable complexity */
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
 *
 */
import { AuthSdkError, OAuthError, WWWAuthError, AuthApiError } from '../errors';
import { httpRequest } from '../http';
import { AccessToken, IDToken, UserClaims, isAccessToken, isIDToken, CustomUserClaims } from './types';

export async function getUserInfo<T extends CustomUserClaims = CustomUserClaims>(
  sdk, accessTokenObject: AccessToken,
  idTokenObject: IDToken
): Promise<UserClaims<T>> {
  // If token objects were not passed, attempt to read from the TokenManager
  if (!accessTokenObject) {
    accessTokenObject = (await sdk.tokenManager.getTokens()).accessToken as AccessToken;
  }
  if (!idTokenObject) {
    idTokenObject = (await sdk.tokenManager.getTokens()).idToken as IDToken;
  }

  if (!accessTokenObject || !isAccessToken(accessTokenObject)) {
    return Promise.reject(new AuthSdkError('getUserInfo requires an access token object'));
  }

  if (!idTokenObject || !isIDToken(idTokenObject)) {
    return Promise.reject(new AuthSdkError('getUserInfo requires an ID token object'));
  }

  const options: any = {
    url: accessTokenObject.userinfoUrl,
    method: 'GET',
    accessToken: accessTokenObject.accessToken
  };

  if (sdk.options.dpop) {
    const headers = await sdk.getDPoPAuthorizationHeaders({...options, accessToken: accessTokenObject });
    options.headers = headers;
    delete options.accessToken;      // unset to prevent overriding Auth header with Bearer Token
  }

  return httpRequest(sdk, options)
    .then(userInfo => {
      // Only return the userinfo response if subjects match to mitigate token substitution attacks
      if (userInfo.sub === idTokenObject.claims.sub) {
        return userInfo;
      }
      return Promise.reject(new AuthSdkError('getUserInfo request was rejected due to token mismatch'));
    })
    .catch(function (err) {
      // throw OAuthError to avoid breaking change (when dpop is not being used)
      if (err instanceof WWWAuthError && !sdk.options.dpop) {
        const { error, errorDescription } = err;
        throw new OAuthError(error, errorDescription);
      }

      // throw OAuthError to avoid breaking change (when dpop is not being used)
      if (!sdk.options.dpop) {
        let e = err;
        if (err instanceof AuthApiError && err?.meta?.wwwAuthHeader) {
          e = WWWAuthError.parseHeader(err.meta.wwwAuthHeader as string);
        }

        if (e instanceof WWWAuthError) {
          const { error, errorDescription } = e;
          throw new OAuthError(error, errorDescription);
        }
      }

      throw err;
    });
}
