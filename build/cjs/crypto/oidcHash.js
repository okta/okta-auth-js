"use strict";

exports.getOidcHash = getOidcHash;

var _base = require("./base64");

var _webcrypto = require("./webcrypto");

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

/* global TextEncoder */
function getOidcHash(str) {
  var buffer = new TextEncoder().encode(str);
  return _webcrypto.webcrypto.subtle.digest('SHA-256', buffer).then(function (arrayBuffer) {
    var intBuffer = new Uint8Array(arrayBuffer);
    var firstHalf = intBuffer.slice(0, 16);
    var hash = String.fromCharCode.apply(null, firstHalf);
    var b64u = (0, _base.stringToBase64Url)(hash); // url-safe base64 variant

    return b64u;
  });
}
//# sourceMappingURL=oidcHash.js.map