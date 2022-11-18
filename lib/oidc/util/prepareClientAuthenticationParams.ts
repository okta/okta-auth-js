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

/* eslint-disable camelcase, complexity */
import { makeJwt } from '../../crypto/jwt';
import { AuthSdkError } from '../../errors';
import { 
  OktaAuthOAuthInterface, 
  ClientAuthenticationOptions,
  ClientAuthenticationParams,
  ClientAuthenticationAssertionParams,
  ClientAuthenticationSecretParams,
} from '../types';

const CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

export async function prepareClientAuthenticationParams(
  sdk: OktaAuthOAuthInterface,
  options: ClientAuthenticationOptions
): Promise<ClientAuthenticationParams> {
  options = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore allow clientId overwrite
    clientId: sdk.options.clientId,
    clientSecret: sdk.options.clientSecret,
    privateKey: sdk.options.privateKey,
    ...options,
  };
  const { clientId, clientSecret, privateKey } = options;

  if (!clientId) {
    throw new AuthSdkError(
      'A clientId must be specified in the OktaAuth constructor to authenticate CIBA client'
    );
  }

  if (clientSecret && privateKey) {
    throw new AuthSdkError(
      'Both clientSecret and privateKey have been detected, only one should be used for client authentication'
    );
  }

  if (!clientSecret && !privateKey) {
    throw new AuthSdkError(
      'A clientSecret or privateKey must be specified in the OktaAuth constructor to authenticate OIDC client'
    );
  }
  
  // handle params for clientSecret
  if (clientSecret) {
    const params: ClientAuthenticationSecretParams = {
      client_id: clientId,
      client_secret: clientSecret
    };
    return params;
  }

  // handle params for privateKey
  if (!options.aud) {
    throw new AuthSdkError('aud is required in options to generate client_assertion');
  }

  const jwt = await makeJwt({
    privateKey: privateKey as string,
    clientId,
    aud: options.aud!
  }).then(jwt => jwt.compact());
  const params: ClientAuthenticationAssertionParams = {
    client_id: clientId,
    client_assertion: jwt,
    client_assertion_type: CLIENT_ASSERTION_TYPE,
  };

  return params;
}
