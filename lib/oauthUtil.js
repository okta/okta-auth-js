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

/* eslint-disable complexity, max-statements */
var http = require('./http');
var util = require('./util');
var storageUtil = require('./browser/browserStorage');
var AuthSdkError = require('./errors/AuthSdkError');

var httpCache = storageUtil.getHttpCache();

function generateState() {
  return util.genRandomString(64);
}

function generateNonce() {
  return util.genRandomString(64);
}

function isToken(obj) {
  if (obj &&
      (obj.accessToken || obj.idToken) &&
      Array.isArray(obj.scopes)) {
    return true;
  }
  return false;
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

  if (util.isIE11OrLess()) {
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

function getWellKnown(sdk, issuer) {
  return http.get(sdk, (issuer || sdk.options.url) + '/.well-known/openid-configuration', {
    cacheResponse: true
  });
}

function getKey(sdk, issuer, kid) {
  return getWellKnown(sdk, issuer)
  .then(function(wellKnown) {
    var jwksUri = wellKnown['jwks_uri'];

    // Check our kid against the cached version (if it exists and isn't expired)
    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[jwksUri];
    if (cachedResponse && Date.now()/1000 < cachedResponse.expiresAt) {
      var cachedKey = util.find(cachedResponse.response.keys, {
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
      var key = util.find(res.keys, {
        kid: kid
      });

      if (key) {
        return key;
      }

      throw new AuthSdkError('The key id, ' + kid + ', was not found in the server\'s keys');
    });
  });
}

function validateClaims(sdk, claims, validationParams) {
  var aud = validationParams.clientId;
  var iss = validationParams.issuer;
  var nonce = validationParams.nonce;

  if (!claims || !iss || !aud) {
    throw new AuthSdkError('The jwt, iss, and aud arguments are all required');
  }

  if (nonce && claims.nonce !== nonce) {
    throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
  }

  var now = Math.floor(new Date().getTime()/1000);

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

function getOAuthUrls(sdk, oauthParams, options) {
  options = options || {};

  // Get user-supplied arguments
  var authorizeUrl = util.removeTrailingSlash(options.authorizeUrl) || sdk.options.authorizeUrl;
  var issuer = util.removeTrailingSlash(options.issuer) || sdk.options.issuer;
  var userinfoUrl = util.removeTrailingSlash(options.userinfoUrl) || sdk.options.userinfoUrl;
  var tokenUrl = util.removeTrailingSlash(options.tokenUrl) || sdk.options.tokenUrl;

  // If an issuer exists but it's not a url, assume it's an authServerId
  if (issuer && !(/^https?:/.test(issuer))) {
    // Make it a url
    issuer = sdk.options.url + '/oauth2/' + issuer;
  }

  // If an authorizeUrl is supplied without an issuer, and an id_token is requested
  if (!issuer && authorizeUrl &&
      oauthParams.responseType.indexOf('id_token') !== -1) {
    // The issuer is ambiguous, so we won't be able to validate the id_token jwt
    throw new AuthSdkError('Cannot request idToken with an authorizeUrl without an issuer');
  }

  // If a token is requested without an issuer
  if (!issuer && oauthParams.responseType.indexOf('token') !== -1) {
    // If an authorizeUrl is supplied without a userinfoUrl
    if (authorizeUrl && !userinfoUrl) {
      // The userinfoUrl is ambiguous, so we won't be able to call getUserInfo
      throw new AuthSdkError('Cannot request accessToken with an authorizeUrl without an issuer or userinfoUrl');
    }

    // If a userinfoUrl is supplied without a authorizeUrl
    if (userinfoUrl && !authorizeUrl) {
      // The authorizeUrl is ambiguous, so we won't be able to call the authorize endpoint
      throw new AuthSdkError('Cannot request token with an userinfoUrl without an issuer or authorizeUrl');
    }
  }

  var sharedResourceServerRegex = new RegExp('^https?://.*?/oauth2/.+');

  // Default the issuer to our baseUrl
  issuer = issuer || sdk.options.url;

  // A shared resource server issuer looks like:
  // https://example.okta.com/oauth2/aus8aus76q8iphupD0h7
  if (sharedResourceServerRegex.test(issuer)) {
    // A shared resource server authorizeUrl looks like:
    // https://example.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize
    authorizeUrl = authorizeUrl || issuer + '/v1/authorize';
    // Shared resource server userinfoUrls look like:
    // https://example.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo
    userinfoUrl = userinfoUrl || issuer + '/v1/userinfo';
    // Shared resource server tokenUrls look like:
    // https://example.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token
    tokenUrl = tokenUrl || issuer + '/v1/token';
  // Normally looks like:
  // https://example.okta.com
  } else {
    // Normal authorizeUrls look like:
    // https://example.okta.com/oauth2/v1/authorize
    authorizeUrl = authorizeUrl || issuer + '/oauth2/v1/authorize';
    // Normal userinfoUrls look like:
    // https://example.okta.com/oauth2/v1/userinfo
    userinfoUrl = userinfoUrl || issuer + '/oauth2/v1/userinfo';
    // Normal tokenUrls look like:
    // https://example.okta.com/oauth2/v1/token
    tokenUrl = tokenUrl || issuer + '/oauth2/v1/token';
  }

  return {
    issuer: issuer,
    authorizeUrl: authorizeUrl,
    userinfoUrl: userinfoUrl,
    tokenUrl: tokenUrl
  };
}

function hashToObject(hash) {
  // Predefine regexs for parsing hash
  var plus2space = /\+/g;
  var paramSplit = /([^&=]+)=?([^&]*)/g;

  // Remove the leading hash
  var fragment = hash.substring(1);

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

module.exports = {
  generateState: generateState,
  generateNonce: generateNonce,
  getWellKnown: getWellKnown,
  getKey: getKey,
  validateClaims: validateClaims,
  getOAuthUrls: getOAuthUrls,
  loadFrame: loadFrame,
  loadPopup: loadPopup,
  hashToObject: hashToObject,
  isToken: isToken,
  addListener: addListener,
  removeListener: removeListener
};
