"use strict";

exports.isToken = isToken;
exports.isAccessToken = isAccessToken;
exports.isIDToken = isIDToken;
exports.isRefreshToken = isRefreshToken;

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
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
function isToken(obj) {
  if (obj && (obj.accessToken || obj.idToken || obj.refreshToken) && Array.isArray(obj.scopes)) {
    return true;
  }

  return false;
}

function isAccessToken(obj) {
  return obj && obj.accessToken;
}

function isIDToken(obj) {
  return obj && obj.idToken;
}

function isRefreshToken(obj) {
  return obj && obj.refreshToken;
}
//# sourceMappingURL=Token.js.map