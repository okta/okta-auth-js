/* eslint-disable complexity */

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
import { isInteractionRequiredError, urlParamsToObject } from './util';
import { isString } from '../util';
import { handleOAuthResponse } from './handleOAuthResponse';

function removeHash(sdk) {
  var nativeHistory = sdk.token.parseFromUrl._getHistory();

  var nativeDoc = sdk.token.parseFromUrl._getDocument();

  var nativeLoc = sdk.token.parseFromUrl._getLocation();

  if (nativeHistory && nativeHistory.replaceState) {
    nativeHistory.replaceState(null, nativeDoc.title, nativeLoc.pathname + nativeLoc.search);
  } else {
    nativeLoc.hash = '';
  }
}

function removeSearch(sdk) {
  var nativeHistory = sdk.token.parseFromUrl._getHistory();

  var nativeDoc = sdk.token.parseFromUrl._getDocument();

  var nativeLoc = sdk.token.parseFromUrl._getLocation();

  if (nativeHistory && nativeHistory.replaceState) {
    nativeHistory.replaceState(null, nativeDoc.title, nativeLoc.pathname + nativeLoc.hash);
  } else {
    nativeLoc.search = '';
  }
}

export function parseFromUrl(sdk, options) {
  options = options || {};

  if (isString(options)) {
    options = {
      url: options
    };
  } else {
    options = options;
  } // https://openid.net/specs/openid-connect-core-1_0.html#Authentication


  var defaultResponseMode = sdk.options.pkce ? 'query' : 'fragment';
  var url = options.url;
  var responseMode = options.responseMode || sdk.options.responseMode || defaultResponseMode;

  var nativeLoc = sdk.token.parseFromUrl._getLocation();

  var paramStr;

  if (responseMode === 'query') {
    paramStr = url ? url.substring(url.indexOf('?')) : nativeLoc.search;
  } else {
    paramStr = url ? url.substring(url.indexOf('#')) : nativeLoc.hash;
  }

  if (!paramStr) {
    return Promise.reject(new AuthSdkError('Unable to parse a token from the url'));
  }

  var oauthParams = sdk.transactionManager.load({
    oauth: true,
    pkce: sdk.options.pkce
  });
  var urls = oauthParams.urls;
  delete oauthParams.urls;
  return Promise.resolve(urlParamsToObject(paramStr)).then(function (res) {
    if (!url) {
      // Clean hash or search from the url
      responseMode === 'query' ? removeSearch(sdk) : removeHash(sdk);
    }

    return handleOAuthResponse(sdk, oauthParams, res, urls).catch(err => {
      if (!isInteractionRequiredError(err)) {
        sdk.transactionManager.clear();
      }

      throw err;
    }).then(res => {
      sdk.transactionManager.clear();
      return res;
    });
  });
}
//# sourceMappingURL=parseFromUrl.js.map