"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.getDefaultOptions = getDefaultOptions;
exports.buildOptions = buildOptions;

var _util = require("./util");

var _builderUtil = require("./builderUtil");

var _fetchRequest = _interopRequireDefault(require("./fetch/fetchRequest"));

var _browserStorage = _interopRequireDefault(require("./browser/browserStorage"));

var _serverStorage = _interopRequireDefault(require("./server/serverStorage"));

var _features = require("./features");

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

/* eslint-disable complexity */
const BROWSER_STORAGE = {
  token: {
    storageTypes: ['localStorage', 'sessionStorage', 'cookie'],
    useMultipleCookies: true
  },
  cache: {
    storageTypes: ['localStorage', 'sessionStorage', 'cookie']
  },
  transaction: {
    storageTypes: ['sessionStorage', 'localStorage', 'cookie']
  }
};
const SERVER_STORAGE = {
  token: {
    storageTypes: ['memory']
  },
  cache: {
    storageTypes: ['memory']
  },
  transaction: {
    storageTypes: ['memory']
  }
};

function getCookieSettings(args = {}, isHTTPS) {
  // Secure cookies will be automatically used on a HTTPS connection
  // Non-secure cookies will be automatically used on a HTTP connection
  // secure option can override the automatic behavior
  var cookieSettings = args.cookies || {};

  if (typeof cookieSettings.secure === 'undefined') {
    cookieSettings.secure = isHTTPS;
  }

  if (typeof cookieSettings.sameSite === 'undefined') {
    cookieSettings.sameSite = cookieSettings.secure ? 'none' : 'lax';
  } // If secure=true, but the connection is not HTTPS, set secure=false.


  if (cookieSettings.secure && !isHTTPS) {
    // eslint-disable-next-line no-console
    (0, _util.warn)('The current page is not being served with the HTTPS protocol.\n' + 'For security reasons, we strongly recommend using HTTPS.\n' + 'If you cannot use HTTPS, set "cookies.secure" option to false.');
    cookieSettings.secure = false;
  } // Chrome >= 80 will block cookies with SameSite=None unless they are also Secure
  // If sameSite=none, but the connection is not HTTPS, set sameSite=lax.


  if (cookieSettings.sameSite === 'none' && !cookieSettings.secure) {
    cookieSettings.sameSite = 'lax';
  }

  return cookieSettings;
}

function getDefaultOptions() {
  const storageUtil = (0, _features.isBrowser)() ? _browserStorage.default : _serverStorage.default;
  const storageManager = (0, _features.isBrowser)() ? BROWSER_STORAGE : SERVER_STORAGE;
  return {
    devMode: false,
    httpRequestClient: _fetchRequest.default,
    storageUtil,
    storageManager
  };
}

function mergeOptions(options, args) {
  return Object.assign({}, options, (0, _util.removeNils)(args), {
    storageManager: Object.assign({}, options.storageManager, args.storageManager)
  });
}

function buildOptions(args = {}) {
  (0, _builderUtil.assertValidConfig)(args);
  args = mergeOptions(getDefaultOptions(), args);
  return (0, _util.removeNils)({
    // OIDC configuration
    issuer: (0, _util.removeTrailingSlash)(args.issuer),
    tokenUrl: (0, _util.removeTrailingSlash)(args.tokenUrl),
    authorizeUrl: (0, _util.removeTrailingSlash)(args.authorizeUrl),
    userinfoUrl: (0, _util.removeTrailingSlash)(args.userinfoUrl),
    revokeUrl: (0, _util.removeTrailingSlash)(args.revokeUrl),
    logoutUrl: (0, _util.removeTrailingSlash)(args.logoutUrl),
    clientId: args.clientId,
    redirectUri: args.redirectUri,
    state: args.state,
    scopes: args.scopes,
    postLogoutRedirectUri: args.postLogoutRedirectUri,
    responseMode: args.responseMode,
    responseType: args.responseType,
    pkce: args.pkce === false ? false : true,
    // PKCE defaults to true
    useInteractionCodeFlow: args.useInteractionCodeFlow,
    // Internal options
    httpRequestClient: args.httpRequestClient,
    transformErrorXHR: args.transformErrorXHR,
    transformAuthState: args.transformAuthState,
    restoreOriginalUri: args.restoreOriginalUri,
    storageUtil: args.storageUtil,
    headers: args.headers,
    devMode: !!args.devMode,
    storageManager: args.storageManager,
    cookies: (0, _features.isBrowser)() ? getCookieSettings(args, (0, _features.isHTTPS)()) : args.cookies,
    // Give the developer the ability to disable token signature validation.
    ignoreSignature: !!args.ignoreSignature,
    // Server-side web applications
    clientSecret: args.clientSecret
  });
}
//# sourceMappingURL=options.js.map