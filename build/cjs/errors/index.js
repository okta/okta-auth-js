"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.isAuthApiError = isAuthApiError;
Object.defineProperty(exports, "AuthApiError", {
  enumerable: true,
  get: function () {
    return _AuthApiError.default;
  }
});
Object.defineProperty(exports, "AuthPollStopError", {
  enumerable: true,
  get: function () {
    return _AuthPollStopError.default;
  }
});
Object.defineProperty(exports, "AuthSdkError", {
  enumerable: true,
  get: function () {
    return _AuthSdkError.default;
  }
});
Object.defineProperty(exports, "OAuthError", {
  enumerable: true,
  get: function () {
    return _OAuthError.default;
  }
});

var _AuthApiError = _interopRequireDefault(require("./AuthApiError"));

var _AuthPollStopError = _interopRequireDefault(require("./AuthPollStopError"));

var _AuthSdkError = _interopRequireDefault(require("./AuthSdkError"));

var _OAuthError = _interopRequireDefault(require("./OAuthError"));

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
 */
function isAuthApiError(obj) {
  return obj instanceof _AuthApiError.default;
}
//# sourceMappingURL=index.js.map