import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { isFunction } from '../util';
import { AuthSdkError, OAuthError } from '../errors';
import { httpRequest } from '../http';
import { isAccessToken, isIDToken } from '../types';
export function getUserInfo(_x, _x2, _x3) {
  return _getUserInfo.apply(this, arguments);
}

function _getUserInfo() {
  _getUserInfo = _asyncToGenerator(function* (sdk, accessTokenObject, idTokenObject) {
    // If token objects were not passed, attempt to read from the TokenManager
    if (!accessTokenObject) {
      accessTokenObject = (yield sdk.tokenManager.getTokens()).accessToken;
    }

    if (!idTokenObject) {
      idTokenObject = (yield sdk.tokenManager.getTokens()).idToken;
    }

    if (!accessTokenObject || !isAccessToken(accessTokenObject)) {
      return Promise.reject(new AuthSdkError('getUserInfo requires an access token object'));
    }

    if (!idTokenObject || !isIDToken(idTokenObject)) {
      return Promise.reject(new AuthSdkError('getUserInfo requires an ID token object'));
    }

    return httpRequest(sdk, {
      url: accessTokenObject.userinfoUrl,
      method: 'GET',
      accessToken: accessTokenObject.accessToken
    }).then(userInfo => {
      // Only return the userinfo response if subjects match to mitigate token substitution attacks
      if (userInfo.sub === idTokenObject.claims.sub) {
        return userInfo;
      }

      return Promise.reject(new AuthSdkError('getUserInfo request was rejected due to token mismatch'));
    }).catch(function (err) {
      if (err.xhr && (err.xhr.status === 401 || err.xhr.status === 403)) {
        var authenticateHeader;

        if (err.xhr.headers && isFunction(err.xhr.headers.get) && err.xhr.headers.get('WWW-Authenticate')) {
          authenticateHeader = err.xhr.headers.get('WWW-Authenticate');
        } else if (isFunction(err.xhr.getResponseHeader)) {
          authenticateHeader = err.xhr.getResponseHeader('WWW-Authenticate');
        }

        if (authenticateHeader) {
          var errorMatches = authenticateHeader.match(/error="(.*?)"/) || [];
          var errorDescriptionMatches = authenticateHeader.match(/error_description="(.*?)"/) || [];
          var error = errorMatches[1];
          var errorDescription = errorDescriptionMatches[1];

          if (error && errorDescription) {
            err = new OAuthError(error, errorDescription);
          }
        }
      }

      throw err;
    });
  });
  return _getUserInfo.apply(this, arguments);
}
//# sourceMappingURL=getUserInfo.js.map