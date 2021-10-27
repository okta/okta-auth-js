"use strict";

exports.getWithRedirect = getWithRedirect;

var _errors = require("../errors");

var _util = require("../util");

var _util2 = require("./util");

var _authorize = require("./endpoints/authorize");

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
function getWithRedirect(sdk, options) {
  if (arguments.length > 2) {
    return Promise.reject(new _errors.AuthSdkError('As of version 3.0, "getWithRedirect" takes only a single set of options'));
  }

  options = (0, _util.clone)(options) || {};
  return (0, _util2.prepareTokenParams)(sdk, options).then(function (tokenParams) {
    const urls = (0, _util2.getOAuthUrls)(sdk, options);
    const requestUrl = urls.authorizeUrl + (0, _authorize.buildAuthorizeParams)(tokenParams);
    const issuer = sdk.options.issuer; // Gather the values we want to save in the transaction

    const {
      responseType,
      state,
      nonce,
      scopes,
      clientId,
      ignoreSignature,
      redirectUri,
      codeVerifier,
      codeChallenge,
      codeChallengeMethod
    } = tokenParams;
    const oauthMeta = {
      issuer,
      responseType,
      state,
      nonce,
      scopes,
      clientId,
      urls,
      ignoreSignature,
      redirectUri,
      codeVerifier,
      codeChallenge,
      codeChallengeMethod
    };
    sdk.transactionManager.save(oauthMeta, {
      oauth: true
    });

    sdk.token.getWithRedirect._setLocation(requestUrl);
  });
}
//# sourceMappingURL=getWithRedirect.js.map