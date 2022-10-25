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

import { getOAuthBaseUrl } from '../util/oauth';
import { httpRequest } from '../../http';
import { removeNils, toQueryString } from '../../util';
import { OktaAuthOAuthInterface, CibaAuthResponse, BcAuthorizeOptions } from '../types';

const CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

export async function postToBcAuthorizeEndpoint(
  sdk: OktaAuthOAuthInterface, 
  options: BcAuthorizeOptions
): Promise<CibaAuthResponse> {
  options = {
    clientId: sdk.options.clientId,
    clientSecret: sdk.options.clientSecret,
    ...options, // favor fn options
  };

  const baseUrl = getOAuthBaseUrl(sdk);
  const bcAuthorizeUrl = `${baseUrl}/v1/bc/authorize`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  
  /* eslint-disable camelcase */
  const args = toQueryString(removeNils({
    // client authentication params
    client_id: options.clientId,
    client_assertion: options.clientAssertion,
    client_assertion_type: options.clientAssertion && CLIENT_ASSERTION_TYPE,
    client_secret: options.clientSecret,
    
    // ciba params
    scope: options.scope,
    acr_values: options.acrValues,
    login_hint: options.loginHint,
    id_token_hint: options.idTokenHint,
    binding_message: options.bindingMessage,
    request_expiry: options.requestExpiry,
  })).slice(1);
  /* eslint-enable camelcase */

  return httpRequest(sdk, {
    url: bcAuthorizeUrl,
    method: 'POST',
    args,
    headers
  });
}
