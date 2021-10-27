import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import { isString, clone, isAbsoluteUrl, removeNils } from '../util';
import AuthApiError from '../errors/AuthApiError';
import { STATE_TOKEN_KEY_NAME, DEFAULT_CACHE_DURATION } from '../constants';
export function httpRequest(sdk, options) {
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

  var headers = _objectSpread({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }, oktaUserAgentHeader);

  Object.assign(headers, sdk.options.headers, options.headers);
  headers = removeNils(headers);

  if (accessToken && isString(accessToken)) {
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

    if (res && isString(res)) {
      res = JSON.parse(res);

      if (res && typeof res === 'object' && !res.headers) {
        res.headers = resp.headers;
      }
    }

    if (saveAuthnState) {
      if (!res.stateToken) {
        storage.delete(STATE_TOKEN_KEY_NAME);
      }
    }

    if (res && res.stateToken && res.expiresAt) {
      storage.set(STATE_TOKEN_KEY_NAME, res.stateToken, res.expiresAt, sdk.options.cookies);
    }

    if (res && options.cacheResponse) {
      httpCache.updateStorage(url, {
        expiresAt: Math.floor(Date.now() / 1000) + DEFAULT_CACHE_DURATION,
        response: res
      });
    }

    return res;
  }).catch(function (resp) {
    var serverErr = resp.responseText || {};

    if (isString(serverErr)) {
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
      resp = sdk.options.transformErrorXHR(clone(resp));
    }

    err = new AuthApiError(serverErr, resp);

    if (err.errorCode === 'E0000011') {
      storage.delete(STATE_TOKEN_KEY_NAME);
    }

    throw err;
  });
}
export function get(sdk, url, options) {
  url = isAbsoluteUrl(url) ? url : sdk.getIssuerOrigin() + url;
  var getOptions = {
    url: url,
    method: 'GET'
  };
  Object.assign(getOptions, options);
  return httpRequest(sdk, getOptions);
}
export function post(sdk, url, args, options) {
  url = isAbsoluteUrl(url) ? url : sdk.getIssuerOrigin() + url;
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