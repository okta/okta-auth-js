import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { getWithoutPrompt } from './getWithoutPrompt';
import { renewTokensWithRefresh } from './renewTokensWithRefresh';
import { getDefaultTokenParams } from './util'; // If we have a refresh token, renew using that, otherwise getWithoutPrompt

export function renewTokens(_x, _x2) {
  return _renewTokens.apply(this, arguments);
}

function _renewTokens() {
  _renewTokens = _asyncToGenerator(function* (sdk, options) {
    var tokens = sdk.tokenManager.getTokensSync();

    if (tokens.refreshToken) {
      return renewTokensWithRefresh(sdk, options, tokens.refreshToken);
    } // Get tokens using the SSO cookie


    options = Object.assign({
      scopes: sdk.options.scopes,
      authorizeUrl: sdk.options.authorizeUrl,
      userinfoUrl: sdk.options.userinfoUrl,
      issuer: sdk.options.issuer
    }, options);

    if (sdk.options.pkce) {
      options.responseType = 'code';
    } else {
      var {
        responseType
      } = getDefaultTokenParams(sdk);
      options.responseType = responseType;
    }

    return getWithoutPrompt(sdk, options).then(res => res.tokens);
  });
  return _renewTokens.apply(this, arguments);
}
//# sourceMappingURL=renewTokens.js.map