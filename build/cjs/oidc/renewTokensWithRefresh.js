"use strict";

exports.renewTokensWithRefresh = renewTokensWithRefresh;

var _errors = require("../errors");

var _oauth = require("./util/oauth");

var _refreshToken = require("./util/refreshToken");

var _handleOAuthResponse = require("./handleOAuthResponse");

var _token = require("./endpoints/token");

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
async function renewTokensWithRefresh(sdk, tokenParams, refreshTokenObject) {
  const {
    clientId
  } = sdk.options;

  if (!clientId) {
    throw new _errors.AuthSdkError('A clientId must be specified in the OktaAuth constructor to renew tokens');
  }

  const renewTokenParams = Object.assign({}, tokenParams, {
    clientId
  });
  const tokenResponse = await (0, _token.postRefreshToken)(sdk, renewTokenParams, refreshTokenObject);
  const urls = (0, _oauth.getOAuthUrls)(sdk, tokenParams);
  const {
    tokens
  } = await (0, _handleOAuthResponse.handleOAuthResponse)(sdk, renewTokenParams, tokenResponse, urls); // Support rotating refresh tokens

  const {
    refreshToken
  } = tokens;

  if (refreshToken && !(0, _refreshToken.isSameRefreshToken)(refreshToken, refreshTokenObject)) {
    sdk.tokenManager.updateRefreshToken(refreshToken);
  }

  return tokens;
}
//# sourceMappingURL=renewTokensWithRefresh.js.map