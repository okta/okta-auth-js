"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.introspect = introspect;

var _oktaIdxJs = _interopRequireDefault(require("@okta/okta-idx-js"));

var _oidc = require("../oidc");

var _constants = require("../constants");

/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
async function introspect(authClient, options) {
  let rawIdxResponse; // try load from storage first

  rawIdxResponse = authClient.transactionManager.loadIdxResponse(); // call idx.introspect if no existing idx response available in storage

  if (!rawIdxResponse) {
    const version = _constants.IDX_API_VERSION;
    const domain = (0, _oidc.getOAuthDomain)(authClient);
    rawIdxResponse = await _oktaIdxJs.default.introspect({
      domain,
      version,
      ...options
    });
  }

  return _oktaIdxJs.default.makeIdxState(rawIdxResponse);
}
//# sourceMappingURL=introspect.js.map