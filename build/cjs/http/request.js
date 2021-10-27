"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.httpRequest = httpRequest;
exports.get = get;
exports.post = post;

var _util = require("../util");

var _AuthApiError = _interopRequireDefault(require("../errors/AuthApiError"));

var _constants = require("../constants");

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

/* eslint-disable complexity */
function httpRequest(sdk, options) {
  options = options || {};
  var url = options.url,
      method = options.method,
      args = options.args,
      saveAuthnState = options.saveAuthnState,
      accessToken = options.accessToken,
      withCredentials = options.withCredentials === true,
      // default value is false
  storageUtil = sdk.options.storageUtil,
      storage = storageUtil.storage,
      httpCache = sdk.storageManager.getHttpCache(sdk.options.cookies);

  if (options.cacheResponse) {
    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[url];

    if (cachedResponse && Date.now() / 1000 < cachedResponse.expiresAt) {
      return Promise.resolve(cachedResponse.response);
    }
  }

  var oktaUserAgentHeader = sdk._oktaUserAgent.getHttpHeader();

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...oktaUserAgentHeader
  };
  Object.assign(headers, sdk.options.headers, options.headers);
  headers = (0, _util.removeNils)(headers);

  if (accessToken && (0, _util.isString)(accessToken)) {
    headers['Authorization'] = 'Bearer ' + accessToken;
  }

  var ajaxOptions = {
    headers,
    data: args || undefined,
    withCredentials
  };
  var err, res;
  return sdk.options.httpRequestClient(method, url, ajaxOptions).then(function (resp) {
    res = resp.responseText;

    if (res && (0, _util.isString)(res)) {
      res = JSON.parse(res);

      if (res && typeof res === 'object' && !res.headers) {
        res.headers = resp.headers;
      }
    }

    if (saveAuthnState) {
      if (!res.stateToken) {
        storage.delete(_constants.STATE_TOKEN_KEY_NAME);
      }
    }

    if (res && res.stateToken && res.expiresAt) {
      storage.set(_constants.STATE_TOKEN_KEY_NAME, res.stateToken, res.expiresAt, sdk.options.cookies);
    }

    if (res && options.cacheResponse) {
      httpCache.updateStorage(url, {
        expiresAt: Math.floor(Date.now() / 1000) + _constants.DEFAULT_CACHE_DURATION,
        response: res
      });
    }

    return res;
  }).catch(function (resp) {
    var serverErr = resp.responseText || {};

    if ((0, _util.isString)(serverErr)) {
      try {
        serverErr = JSON.parse(serverErr);
      } catch (e) {
        serverErr = {
          errorSummary: 'Unknown error'
        };
      }
    }

    if (resp.status >= 500) {
      serverErr.errorSummary = 'Unknown error';
    }

    if (sdk.options.transformErrorXHR) {
      resp = sdk.options.transformErrorXHR((0, _util.clone)(resp));
    }

    err = new _AuthApiError.default(serverErr, resp);

    if (err.errorCode === 'E0000011') {
      storage.delete(_constants.STATE_TOKEN_KEY_NAME);
    }

    throw err;
  });
}

function get(sdk, url, options) {
  url = (0, _util.isAbsoluteUrl)(url) ? url : sdk.getIssuerOrigin() + url;
  var getOptions = {
    url: url,
    method: 'GET'
  };
  Object.assign(getOptions, options);
  return httpRequest(sdk, getOptions);
}

function post(sdk, url, args, options) {
  url = (0, _util.isAbsoluteUrl)(url) ? url : sdk.getIssuerOrigin() + url;
  var postOptions = {
    url: url,
    method: 'POST',
    args: args,
    saveAuthnState: true
  };
  Object.assign(postOptions, options);
  return httpRequest(sdk, postOptions);
}
//# sourceMappingURL=request.js.map