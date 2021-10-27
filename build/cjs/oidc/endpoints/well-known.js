"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.getWellKnown = getWellKnown;
exports.getKey = getKey;

var _http = require("../../http");

var _util = require("../../util");

var _AuthSdkError = _interopRequireDefault(require("../../errors/AuthSdkError"));

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
function getWellKnown(sdk, issuer) {
  var authServerUri = issuer || sdk.options.issuer;
  return (0, _http.get)(sdk, authServerUri + '/.well-known/openid-configuration', {
    cacheResponse: true
  });
}

function getKey(sdk, issuer, kid) {
  var httpCache = sdk.storageManager.getHttpCache(sdk.options.cookies);
  return getWellKnown(sdk, issuer).then(function (wellKnown) {
    var jwksUri = wellKnown['jwks_uri']; // Check our kid against the cached version (if it exists and isn't expired)

    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[jwksUri];

    if (cachedResponse && Date.now() / 1000 < cachedResponse.expiresAt) {
      var cachedKey = (0, _util.find)(cachedResponse.response.keys, {
        kid: kid
      });

      if (cachedKey) {
        return cachedKey;
      }
    } // Remove cache for the key


    httpCache.clearStorage(jwksUri); // Pull the latest keys if the key wasn't in the cache

    return (0, _http.get)(sdk, jwksUri, {
      cacheResponse: true
    }).then(function (res) {
      var key = (0, _util.find)(res.keys, {
        kid: kid
      });

      if (key) {
        return key;
      }

      throw new _AuthSdkError.default('The key id, ' + kid + ', was not found in the server\'s keys');
    });
  });
}
//# sourceMappingURL=well-known.js.map