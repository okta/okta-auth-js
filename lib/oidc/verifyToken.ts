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
import { getKey, validateClaims } from '../oidc';
import { AuthSdkError } from '../errors';
import { IDToken, OktaAuth, TokenVerifyParams } from '../types';
import { decodeToken } from './decodeToken';
import * as sdkCrypto from '../crypto';

// Verify the id token
export function verifyToken(sdk: OktaAuth, token: IDToken, validationParams: TokenVerifyParams): Promise<IDToken> {
  return Promise.resolve()
    .then(function () {
      if (!token || !token.idToken) {
        throw new AuthSdkError('Only idTokens may be verified');
      }

      var jwt = decodeToken(token.idToken);

      var validationOptions: TokenVerifyParams = {
        clientId: sdk.options.clientId,
        issuer: sdk.options.issuer,
        ignoreSignature: sdk.options.ignoreSignature
      };

      Object.assign(validationOptions, validationParams);

      // Standard claim validation
      validateClaims(sdk, jwt.payload, validationOptions);

      // If the browser doesn't support native crypto or we choose not
      // to verify the signature, bail early
      if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
        return token;
      }

      return getKey(sdk, token.issuer, jwt.header.kid)
        .then(function (key) {
          return sdkCrypto.verifyToken(token.idToken, key);
        })
        .then(function (valid) {
          if (!valid) {
            throw new AuthSdkError('The token signature is not valid');
          }
          if (validationParams && validationParams.accessToken && token.claims.at_hash) {
            return sdkCrypto.getOidcHash(validationParams.accessToken)
              .then(hash => {
                if (hash !== token.claims.at_hash) {
                  throw new AuthSdkError('Token hash verification failed');
                }
              });
          }
        })
        .then(() => {
          return token;
        });
    });
}