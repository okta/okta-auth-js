"use strict";

exports.verifyToken = verifyToken;

var _wellKnown = require("./endpoints/well-known");

var _util = require("./util");

var _errors = require("../errors");

var _decodeToken = require("./decodeToken");

var sdkCrypto = _interopRequireWildcard(require("../crypto"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
// Verify the id token
async function verifyToken(sdk, token, validationParams) {
  if (!token || !token.idToken) {
    throw new _errors.AuthSdkError('Only idTokens may be verified');
  } // Decode the Jwt object (may throw)


  var jwt = (0, _decodeToken.decodeToken)(token.idToken); // The configured issuer may point to a frontend proxy.
  // Get the "real" issuer from .well-known/openid-configuration

  const configuredIssuer = (validationParams === null || validationParams === void 0 ? void 0 : validationParams.issuer) || sdk.options.issuer;
  const {
    issuer
  } = await (0, _wellKnown.getWellKnown)(sdk, configuredIssuer);
  var validationOptions = Object.assign({
    // base options, can be overridden by params
    clientId: sdk.options.clientId,
    ignoreSignature: sdk.options.ignoreSignature
  }, validationParams, {
    // final options, cannot be overridden
    issuer
  }); // Standard claim validation (may throw)

  (0, _util.validateClaims)(sdk, jwt.payload, validationOptions); // If the browser doesn't support native crypto or we choose not
  // to verify the signature, bail early

  if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
    return token;
  }

  const key = await (0, _wellKnown.getKey)(sdk, token.issuer, jwt.header.kid);
  const valid = await sdkCrypto.verifyToken(token.idToken, key);

  if (!valid) {
    throw new _errors.AuthSdkError('The token signature is not valid');
  }

  if (validationParams && validationParams.accessToken && token.claims.at_hash) {
    const hash = await sdkCrypto.getOidcHash(validationParams.accessToken);

    if (hash !== token.claims.at_hash) {
      throw new _errors.AuthSdkError('Token hash verification failed');
    }
  }

  return token;
}
//# sourceMappingURL=verifyToken.js.map