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
import { isString, clone, isAbsoluteUrl, removeNils } from './util';
import AuthApiError from './errors/AuthApiError';
import { STATE_TOKEN_KEY_NAME, DEFAULT_CACHE_DURATION } from './constants';
import { OktaAuth, RequestOptions, FetchOptions, RequestData } from './types';

function httpRequest(sdk: OktaAuth, options: RequestOptions): Promise<any> {
  options = options || {};
  var url = options.url,
      method = options.method,
      args = options.args,
      saveAuthnState = options.saveAuthnState,
      accessToken = options.accessToken,
      withCredentials = options.withCredentials !== false, // default value is true
      storageUtil = sdk.options.storageUtil,
      storage = storageUtil.storage,
      httpCache = storageUtil.getHttpCache(sdk.options.cookies);

  if (options.cacheResponse) {
    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[url];
    if (cachedResponse && Date.now()/1000 < cachedResponse.expiresAt) {
      return Promise.resolve(cachedResponse.response);
    }
  }

  var headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Okta-User-Agent-Extended': sdk.userAgent
  };
  Object.assign(headers, sdk.options.headers, options.headers);
  headers = removeNils(headers) as HeadersInit;

  if (accessToken && isString(accessToken)) {
    headers['Authorization'] = 'Bearer ' + accessToken;
  }

  var ajaxOptions: FetchOptions = {
    headers: headers,
    data: args || undefined,
    withCredentials: withCredentials
  };

  var err, res;
  return sdk.options.httpRequestClient(method, url, ajaxOptions)
    .then(function(resp) {
      res = resp.responseText;
      if (res && isString(res)) {
        res = JSON.parse(res);
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
          expiresAt: Math.floor(Date.now()/1000) + DEFAULT_CACHE_DURATION,
          response: res
        });
      }

      return res;
    })
    .catch(function(resp) {
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

function get(sdk: OktaAuth, url: string, options?: RequestOptions) {
  url = isAbsoluteUrl(url) ? url : sdk.getIssuerOrigin() + url;
  var getOptions = {
    url: url,
    method: 'GET'
  };
  Object.assign(getOptions, options);
  return httpRequest(sdk, getOptions);
}

function post(sdk: OktaAuth, url: string, args?: RequestData, options?: RequestOptions) {
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

export default {
  get: get,
  post: post,
  httpRequest: httpRequest
};
