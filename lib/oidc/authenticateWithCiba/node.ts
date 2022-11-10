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

import { getOAuthBaseUrl } from '../util';
import { AuthSdkError } from '../../errors';
import { OktaAuthOAuthInterface, CibaAuthOptions, CibaAuthResponse, CibaAuthorizeParams } from '../types';
import { postToBcAuthorizeEndpoint } from '../endpoints/bc-authorize';
import { prepareClientAuthenticationParams } from '../util/prepareClientAuthenticationParams';
import { removeNils } from '../../util';

/* eslint complexity:[0,8] */
/* eslint-disable camelcase */
export async function authenticateWithCiba(
  sdk: OktaAuthOAuthInterface, 
  options: CibaAuthOptions
): Promise<CibaAuthResponse> {
  options = {
    clientId: sdk.options.clientId,
    clientSecret: sdk.options.clientSecret,
    privateKey: sdk.options.privateKey,
    scopes: sdk.options.scopes,
    ...options, // favor fn options
  };

  const aud = getOAuthBaseUrl(sdk) + '/v1/bc/authorize';
  const clientAuthParams = await prepareClientAuthenticationParams(sdk, {
    clientId: options.clientId!,
    clientSecret: options.clientSecret,
    privateKey: options.privateKey,
    aud,
  });

  if (options.scopes?.indexOf('openid') === -1) {
    throw new AuthSdkError(
      'openid scope must be specified in the scopes argument to authenticate CIBA client'
    );
  }

  if (!options.loginHint && !options.idTokenHint) {
    throw new AuthSdkError(
      'A loginHint or idTokenHint must be specified in the function options to authenticate CIBA client'
    );
  }

  const payload = removeNils({
    ...clientAuthParams,
    scope: options.scopes!.join(' '),
    login_hint: options.loginHint,
    id_token_hint: options.idTokenHint,
    acr_values: options.acrValues,
    binding_message: options.bindingMessage,
    request_expiry: options.requestExpiry,
  }) as CibaAuthorizeParams;

  return postToBcAuthorizeEndpoint(sdk, payload);
}
