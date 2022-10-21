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

import { makeJwt } from '../../crypto/jwt';
import { getOAuthBaseUrl } from '../util/oauth';
import { AuthSdkError } from '../../errors';
import { OktaAuthOAuthInterface, CibaAuthOptions, CibaAuthResponse, BcAuthorizeOptions } from '../types';
import { postToBcAuthorizeEndpoint } from '../endpoints/bc-authorize';

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

  if (!options.clientId) {
    throw new AuthSdkError(
      'A clientId must be specified in the OktaAuth constructor to authenticate CIBA client'
    );
  }
  
  if (!options.clientSecret && !options.privateKey) {
    throw new AuthSdkError(
      'A clientSecret or privateKey must be specified in the OktaAuth constructor to authenticate CIBA client'
    );
  }

  if (options.scopes!.indexOf('openid') === -1) {
    throw new AuthSdkError(
      'openid scope must be specified in the scopes argument to authenticate CIBA client'
    );
  }

  if (!options.loginHint && !options.idTokenHint) {
    throw new AuthSdkError(
      'A loginHint or idTokenHint must be specified in the function options to authenticate CIBA client'
    );
  }

  const baseUrl = getOAuthBaseUrl(sdk);
  const bcAuthorizeUrl = `${baseUrl}/v1/bc/authorize`;

  const { privateKey, scopes, ...params } = options;

  const bcAuthorizeOptions: BcAuthorizeOptions = {
    ...params,
    scope: scopes!.join(' ')
  };
  if (privateKey) {
    const jwt = await makeJwt({
      privateKey,
      clientId: options.clientId,
      aud: bcAuthorizeUrl
    }).then(jwt => jwt.compact());
    bcAuthorizeOptions.clientAssertion = jwt;
  }

  return postToBcAuthorizeEndpoint(sdk, bcAuthorizeOptions);
}
