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

/* eslint complexity:[0,8] */
import http from '../http';
import { toQueryString } from '../util';
import {
  getOAuthUrls,
} from './util/oauth';
import { getBtoa } from '../crypto';
import AuthSdkError from '../errors/AuthSdkError';
import {
  OktaAuth,
  RevocableToken,
  AccessToken,
  RefreshToken
} from '../types';

// refresh tokens have precedence to be revoked if no token is specified
export function revokeToken(sdk: OktaAuth, token: RevocableToken): Promise<any> {
  return Promise.resolve()
    .then(function () {
      var accessToken: string;
      var refreshToken: string;
      if (token) { 
          accessToken = (token as AccessToken).accessToken;
          refreshToken = (token as RefreshToken).refreshToken;  
      }
        
      if(!accessToken && !refreshToken) { 
        throw new AuthSdkError('A valid access or refresh token object is required');
      }
      var clientId = sdk.options.clientId;
      var clientSecret = sdk.options.clientSecret;
      if (!clientId) {
        throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to revoke a token');
      }
      var revokeUrl = getOAuthUrls(sdk).revokeUrl;
      var args = toQueryString({
        // eslint-disable-next-line camelcase
        token_type_hint: refreshToken ? 'refresh_token' : 'access_token', 
        token: refreshToken || accessToken,
      }).slice(1);
      return getBtoa().then((btoa) => {
        var creds = clientSecret ? (btoa as Function)(`${clientId}:${clientSecret}`) : (btoa as Function)(clientId);
        return http.post(sdk, revokeUrl, args, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + creds
          }
        });
      });
    });
}