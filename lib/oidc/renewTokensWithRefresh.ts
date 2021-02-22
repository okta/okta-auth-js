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
import { AuthSdkError } from '../errors';
import http from '../http';
import { getOAuthUrls } from './util/oauth';
import { OktaAuth, TokenParams, RefreshToken, Tokens } from '../types';
import { handleOAuthResponse } from './handleOAuthResponse';

export async function renewTokensWithRefresh(
  sdk: OktaAuth,
  tokenParams: TokenParams,
  refreshTokenObject: RefreshToken
): Promise<Tokens> {
  var clientId = sdk.options.clientId;
  if (!clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to revoke a token');
  }

  var urls = getOAuthUrls(sdk, tokenParams);

  const response = await http.httpRequest(sdk, {
    url: refreshTokenObject.tokenUrl,
    method: 'POST',
    withCredentials: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },

    args: Object.entries({
      client_id: clientId, // eslint-disable-line camelcase
      grant_type: 'refresh_token', // eslint-disable-line camelcase
      scope: refreshTokenObject.scopes.join(' '),
      refresh_token: refreshTokenObject.refreshToken, // eslint-disable-line camelcase
    }).map(function ([name, value]) {
      return name + '=' + encodeURIComponent(value);
    }).join('&'),
  });

  const renewTokenOptions = {
    clientId,
  };
  return handleOAuthResponse(sdk, renewTokenOptions, response, urls).then(res => res.tokens);
}
