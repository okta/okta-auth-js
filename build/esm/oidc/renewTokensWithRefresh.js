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
import { AuthSdkError } from '../errors';
import { getOAuthUrls } from './util/oauth';
import { isSameRefreshToken } from './util/refreshToken';
import { handleOAuthResponse } from './handleOAuthResponse';
import { postRefreshToken } from './endpoints/token';
export function renewTokensWithRefresh(_x, _x2, _x3) {
  return _renewTokensWithRefresh.apply(this, arguments);
}

function _renewTokensWithRefresh() {
  _renewTokensWithRefresh = _asyncToGenerator(function* (sdk, tokenParams, refreshTokenObject) {
    var {
      clientId
    } = sdk.options;

    if (!clientId) {
      throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to renew tokens');
    }

    var renewTokenParams = Object.assign({}, tokenParams, {
      clientId
    });
    var tokenResponse = yield postRefreshToken(sdk, renewTokenParams, refreshTokenObject);
    var urls = getOAuthUrls(sdk, tokenParams);
    var {
      tokens
    } = yield handleOAuthResponse(sdk, renewTokenParams, tokenResponse, urls); // Support rotating refresh tokens

    var {
      refreshToken
    } = tokens;

    if (refreshToken && !isSameRefreshToken(refreshToken, refreshTokenObject)) {
      sdk.tokenManager.updateRefreshToken(refreshToken);
    }

    return tokens;
  });
  return _renewTokensWithRefresh.apply(this, arguments);
}
//# sourceMappingURL=renewTokensWithRefresh.js.map