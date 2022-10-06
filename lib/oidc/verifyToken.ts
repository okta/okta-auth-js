/* eslint-disable max-len */
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
import { getWellKnown, getKey } from './endpoints/well-known';
import { validateClaims } from './util';
import { AuthSdkError } from '../errors';
import { IDToken, OktaAuthOAuthInterface, TokenVerifyParams } from '../oidc/types';
import { decodeToken } from './decodeToken';
import * as sdkCrypto from '../crypto';

// Verify the id token
export async function verifyToken(sdk: OktaAuthOAuthInterface, token: IDToken, validationParams: TokenVerifyParams): Promise<IDToken> {
  if (!token || !token.idToken) {
    throw new AuthSdkError('Only idTokens may be verified');
  }

  // Decode the Jwt object (may throw)
  const jwt = decodeToken(token.idToken);

  // The configured issuer may point to a frontend proxy.
  // Get the "real" issuer from .well-known/openid-configuration
  const configuredIssuer = validationParams?.issuer || sdk.options.issuer;
  const { issuer } = await getWellKnown(sdk, configuredIssuer);

  const validationOptions: TokenVerifyParams = Object.assign({
    // base options, can be overridden by params
    clientId: sdk.options.clientId,
    ignoreSignature: sdk.options.ignoreSignature
  }, validationParams, {
    // final options, cannot be overridden
    issuer
  });

  // Standard claim validation (may throw)
  validateClaims(sdk, jwt.payload, validationOptions);

  // If the browser doesn't support native crypto or we choose not
  // to verify the signature, bail early
  if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
    return token;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const key = await getKey(sdk, token.issuer, jwt.header.kid!);
  const valid = await sdkCrypto.verifyToken(token.idToken, key);
  if (!valid) {
    throw new AuthSdkError('The token signature is not valid');
  }
  if (validationParams && validationParams.accessToken && token.claims.at_hash) {
    const hash = await sdkCrypto.getOidcHash(validationParams.accessToken);
    if (hash !== token.claims.at_hash) {
      throw new AuthSdkError('Token hash verification failed');
    }
  }
  return token;
}
