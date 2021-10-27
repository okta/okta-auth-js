import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { decodeToken } from './decodeToken';
import * as sdkCrypto from '../crypto'; // Verify the id token

export function verifyToken(_x, _x2, _x3) {
  return _verifyToken.apply(this, arguments);
}

function _verifyToken() {
  _verifyToken = _asyncToGenerator(function* (sdk, token, validationParams) {
    if (!token || !token.idToken) {
      throw new AuthSdkError('Only idTokens may be verified');
    } // Decode the Jwt object (may throw)


    var jwt = decodeToken(token.idToken); // The configured issuer may point to a frontend proxy.
    // Get the "real" issuer from .well-known/openid-configuration

    var configuredIssuer = (validationParams === null || validationParams === void 0 ? void 0 : validationParams.issuer) || sdk.options.issuer;
    var {
      issuer
    } = yield getWellKnown(sdk, configuredIssuer);
    var validationOptions = Object.assign({
      // base options, can be overridden by params
      clientId: sdk.options.clientId,
      ignoreSignature: sdk.options.ignoreSignature
    }, validationParams, {
      // final options, cannot be overridden
      issuer
    }); // Standard claim validation (may throw)

    validateClaims(sdk, jwt.payload, validationOptions); // If the browser doesn't support native crypto or we choose not
    // to verify the signature, bail early

    if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
      return token;
    }

    var key = yield getKey(sdk, token.issuer, jwt.header.kid);
    var valid = yield sdkCrypto.verifyToken(token.idToken, key);

    if (!valid) {
      throw new AuthSdkError('The token signature is not valid');
    }

    if (validationParams && validationParams.accessToken && token.claims.at_hash) {
      var hash = yield sdkCrypto.getOidcHash(validationParams.accessToken);

      if (hash !== token.claims.at_hash) {
        throw new AuthSdkError('Token hash verification failed');
      }
    }

    return token;
  });
  return _verifyToken.apply(this, arguments);
}
//# sourceMappingURL=verifyToken.js.map