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


import { CustomUrls, TokenParamsProto, OAuthResponse, RefreshToken, TokenParams } from '../types';
import { toQueryString, removeNils } from '../../util';
import { httpRequest, OktaAuthHttpInterface } from '../../http';

// General function to post data to token endpoint
export function postToTokenEndpoint(sdk, options: TokenParamsProto, urls: CustomUrls): Promise<OAuthResponse> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const args = toQueryString(removeNils(options)).slice(1);
  return httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args,
    headers
  });
}

export function postRefreshToken(
  sdk: OktaAuthHttpInterface,
  options: TokenParams,
  refreshToken: RefreshToken
): Promise<OAuthResponse> {
  return httpRequest(sdk, {
    url: refreshToken.tokenUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },

    args: Object.entries({
      client_id: options.clientId, // eslint-disable-line camelcase
      grant_type: 'refresh_token', // eslint-disable-line camelcase
      scope: refreshToken.scopes.join(' '),
      refresh_token: refreshToken.refreshToken, // eslint-disable-line camelcase
    }).map(function ([name, value]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return name + '=' + encodeURIComponent(value!);
    }).join('&'),
  });
}
