"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.prepareTokenParams = prepareTokenParams;

var _wellKnown = require("../endpoints/well-known");

var _errors = require("../../errors");

var _util = require("../../util");

var _defaultTokenParams = require("./defaultTokenParams");

var _constants = require("../../constants");

var _pkce = _interopRequireDefault(require("./pkce"));

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
// Prepares params for a call to /authorize or /token
function prepareTokenParams(sdk, tokenParams) {
  // build params using defaults + options
  const defaults = (0, _defaultTokenParams.getDefaultTokenParams)(sdk);
  tokenParams = Object.assign({}, defaults, (0, _util.clone)(tokenParams));

  if (tokenParams.pkce === false) {
    // Implicit flow or authorization_code without PKCE
    return Promise.resolve(tokenParams);
  } // PKCE flow


  if (!sdk.features.isPKCESupported()) {
    var errorMessage = 'PKCE requires a modern browser with encryption support running in a secure context.';

    if (!sdk.features.isHTTPS()) {
      // eslint-disable-next-line max-len
      errorMessage += '\nThe current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.';
    }

    if (!sdk.features.hasTextEncoder()) {
      // eslint-disable-next-line max-len
      errorMessage += '\n"TextEncoder" is not defined. To use PKCE, you may need to include a polyfill/shim for this browser.';
    }

    return Promise.reject(new _errors.AuthSdkError(errorMessage));
  } // set default code challenge method, if none provided


  if (!tokenParams.codeChallengeMethod) {
    tokenParams.codeChallengeMethod = _constants.DEFAULT_CODE_CHALLENGE_METHOD;
  } // responseType is forced


  tokenParams.responseType = 'code';
  return (0, _wellKnown.getWellKnown)(sdk, null).then(function (res) {
    var methods = res['code_challenge_methods_supported'] || [];

    if (methods.indexOf(tokenParams.codeChallengeMethod) === -1) {
      throw new _errors.AuthSdkError('Invalid code_challenge_method');
    }
  }).then(function () {
    if (!tokenParams.codeVerifier) {
      tokenParams.codeVerifier = _pkce.default.generateVerifier();
    }

    return _pkce.default.computeChallenge(tokenParams.codeVerifier);
  }).then(function (codeChallenge) {
    // Clone/copy the params. Set codeChallenge
    var clonedParams = (0, _util.clone)(tokenParams) || {};
    Object.assign(clonedParams, tokenParams, {
      codeChallenge: codeChallenge
    });
    return clonedParams;
  });
}
//# sourceMappingURL=prepareTokenParams.js.map