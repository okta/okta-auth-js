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
/* global window, document */
/* eslint-disable complexity, max-statements */
import http from './http';
import { genRandomString, isIE11OrLess, find, removeTrailingSlash } from './util';
import AuthSdkError from './errors/AuthSdkError';
import { OktaAuth, CustomUrls, TokenVerifyParams, UserClaims, WellKnownResponse } from './types';

function generateState() {
  return genRandomString(64);
}

function generateNonce() {
  return genRandomString(64);
}

function addListener(eventTarget, name, fn) {
  if (eventTarget.addEventListener) {
    eventTarget.addEventListener(name, fn);
  } else {
    eventTarget.attachEvent('on' + name, fn);
  }
}

function removeListener(eventTarget, name, fn) {
  if (eventTarget.removeEventListener) {
    eventTarget.removeEventListener(name, fn);
  } else {
    eventTarget.detachEvent('on' + name, fn);
  }
}

function loadFrame(src) {
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = src;

  return document.body.appendChild(iframe);
}

function loadPopup(src, options) {
  var title = options.popupTitle || 'External Identity Provider User Authentication';
  var appearance = 'toolbar=no, scrollbars=yes, resizable=yes, ' +
    'top=100, left=500, width=600, height=600';

  if (isIE11OrLess()) {
    // IE<=11 doesn't fully support postMessage at time of writting.
    // the following simple solution happened to solve the issue
    // without adding another proxy layer which makes flow more complecated.
    var winEl = window.open('/', title, appearance);
    winEl.location.href = src;
    return winEl;
  } else {
    return window.open(src, title, appearance);
  }
}

function getWellKnown(sdk: OktaAuth, issuer: string): Promise<WellKnownResponse> {
  var authServerUri = (issuer || sdk.options.issuer);
  return http.get(sdk, authServerUri + '/.well-known/openid-configuration', {
    cacheResponse: true
  });
}

function getKey(sdk: OktaAuth, issuer: string, kid: string): Promise<string> {
  var httpCache = sdk.storageManager.getHttpCache(sdk.options.cookies);

  return getWellKnown(sdk, issuer)
  .then(function(wellKnown) {
    var jwksUri = wellKnown['jwks_uri'];

    // Check our kid against the cached version (if it exists and isn't expired)
    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[jwksUri];
    if (cachedResponse && Date.now()/1000 < cachedResponse.expiresAt) {
      var cachedKey = find(cachedResponse.response.keys, {
        kid: kid
      });

      if (cachedKey) {
        return cachedKey;
      }
    }

    // Remove cache for the key
    httpCache.clearStorage(jwksUri);

    // Pull the latest keys if the key wasn't in the cache
    return http.get(sdk, jwksUri, {
      cacheResponse: true
    })
    .then(function(res) {
      var key = find(res.keys, {
        kid: kid
      });

      if (key) {
        return key;
      }

      throw new AuthSdkError('The key id, ' + kid + ', was not found in the server\'s keys');
    });
  });
}

function validateClaims(sdk: OktaAuth, claims: UserClaims, validationParams: TokenVerifyParams) {
  var aud = validationParams.clientId;
  var iss = validationParams.issuer;
  var nonce = validationParams.nonce;

  if (!claims || !iss || !aud) {
    throw new AuthSdkError('The jwt, iss, and aud arguments are all required');
  }

  if (nonce && claims.nonce !== nonce) {
    throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
  }

  var now = Math.floor(Date.now()/1000);

  if (claims.iss !== iss) {
    throw new AuthSdkError('The issuer [' + claims.iss + '] ' +
      'does not match [' + iss + ']');
  }

  if (claims.aud !== aud) {
    throw new AuthSdkError('The audience [' + claims.aud + '] ' +
      'does not match [' + aud + ']');
  }

  if (claims.iat > claims.exp) {
    throw new AuthSdkError('The JWT expired before it was issued');
  }

  if ((now - sdk.options.maxClockSkew) > claims.exp) {
    throw new AuthSdkError('The JWT expired and is no longer valid');
  }

  if (claims.iat > (now + sdk.options.maxClockSkew)) {
    throw new AuthSdkError('The JWT was issued in the future');
  }
}

function getOAuthUrls(sdk: OktaAuth, options?: CustomUrls) {
  if (arguments.length > 2) {
    throw new AuthSdkError('As of version 3.0, "getOAuthUrls" takes only a single set of options');
  }
  options = options || {};

  // Get user-supplied arguments
  var authorizeUrl = removeTrailingSlash(options.authorizeUrl) || sdk.options.authorizeUrl;
  var issuer = removeTrailingSlash(options.issuer) || sdk.options.issuer;
  var userinfoUrl = removeTrailingSlash(options.userinfoUrl) || sdk.options.userinfoUrl;
  var tokenUrl = removeTrailingSlash(options.tokenUrl) || sdk.options.tokenUrl;
  var logoutUrl = removeTrailingSlash(options.logoutUrl) || sdk.options.logoutUrl;
  var revokeUrl = removeTrailingSlash(options.revokeUrl) || sdk.options.revokeUrl;

  var baseUrl = issuer.indexOf('/oauth2') > 0 ? issuer : issuer + '/oauth2';

  authorizeUrl = authorizeUrl || baseUrl + '/v1/authorize';
  userinfoUrl = userinfoUrl || baseUrl + '/v1/userinfo';
  tokenUrl = tokenUrl || baseUrl + '/v1/token';
  revokeUrl = revokeUrl || baseUrl + '/v1/revoke';
  logoutUrl = logoutUrl || baseUrl + '/v1/logout';

  return {
    issuer: issuer,
    authorizeUrl: authorizeUrl,
    userinfoUrl: userinfoUrl,
    tokenUrl: tokenUrl,
    revokeUrl: revokeUrl,
    logoutUrl: logoutUrl
  };
}

function urlParamsToObject(hashOrSearch: string) {
  // Predefine regexs for parsing hash
  var plus2space = /\+/g;
  var paramSplit = /([^&=]+)=?([^&]*)/g;
  var fragment = hashOrSearch;

  // Some hash based routers will automatically add a / character after the hash
  if (fragment.charAt(0) === '#' && fragment.charAt(1) === '/') {
    fragment = fragment.substring(2);
  }

  // Remove the leading # or ?
  if (fragment.charAt(0) === '#' || fragment.charAt(0) === '?') {
    fragment = fragment.substring(1);
  }


  var obj = {};

  // Loop until we have no more params
  var param;
  while (true) { // eslint-disable-line no-constant-condition
    param = paramSplit.exec(fragment);
    if (!param) { break; }

    var key = param[1];
    var value = param[2];

    // id_token should remain base64url encoded
    if (key === 'id_token' || key === 'access_token' || key === 'code') {
      obj[key] = value;
    } else {
      obj[key] = decodeURIComponent(value.replace(plus2space, ' '));
    }
  }
  return obj;
}

function hasTokensInHash(hash: string): boolean {
  return /((id|access)_token=)/i.test(hash);
}

function hasCodeInUrl(hashOrSearch: string): boolean {
  return /(code=)/i.test(hashOrSearch);
}

function hasErrorInUrl(hashOrSearch: string): boolean {
  return /(error=)/i.test(hashOrSearch) || /(error_description)/i.test(hashOrSearch);
}

function isRedirectUri(uri: string, sdk: OktaAuth): boolean {
  var authParams = sdk.options;
  return uri && uri.indexOf(authParams.redirectUri) === 0;
}

/**
 * Check if tokens or a code have been passed back into the url, which happens in
 * the OIDC (including social auth IDP) redirect flow.
 */
function isLoginRedirect (sdk: OktaAuth) {
  // First check, is this a redirect URI?
  if (!isRedirectUri(window.location.href, sdk)){
    return false;
  }

  // The location contains either a code, token, or an error&error_description
  var authParams = sdk.options;
  var codeFlow = authParams.pkce || authParams.responseType === 'code' || authParams.responseMode === 'query';
  var useQuery = codeFlow && authParams.responseMode !== 'fragment';

  if (hasErrorInUrl(useQuery ? window.location.search : window.location.hash)) {
    return true;
  }

  if (codeFlow) {
    var hasCode =  useQuery ? hasCodeInUrl(window.location.search) : hasCodeInUrl(window.location.hash);
    return hasCode;
  }

  // implicit flow, will always be hash fragment
  return hasTokensInHash(window.location.hash);
}

export {
  generateState,
  generateNonce,
  getWellKnown,
  getKey,
  validateClaims,
  getOAuthUrls,
  loadFrame,
  loadPopup,
  urlParamsToObject,
  isLoginRedirect,
  addListener,
  removeListener
};
