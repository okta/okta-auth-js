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
/* eslint-disable max-statements */
/* SDK_VERSION is defined in webpack config */ 
/* global SDK_VERSION */
/* global window, navigator, document, crypto */
var Emitter           = require('tiny-emitter');
var AuthSdkError      = require('../errors/AuthSdkError');
var builderUtil       = require('../builderUtil');
var constants         = require('../constants');
var cookies           = require('./browserStorage').storage;
var http              = require('../http');
var oauthUtil         = require('../oauthUtil');
var session           = require('../session');
var token             = require('../token');
var TokenManager      = require('../TokenManager');
var tx                = require('../tx');
var util              = require('../util');

function OktaAuthBuilder(args) {
  var sdk = this;

  builderUtil.assertValidConfig(args);

  var cookieSettings = util.extend({
    secure: true
  }, args.cookies);
  var isLocalhost = (sdk.features.isLocalhost() && !sdk.features.isHTTPS());
  if (isLocalhost) {
    cookieSettings.secure = false; // Force secure=false if running on http://localhost
  }
  if (typeof cookieSettings.sameSite === 'undefined') {
    // Chrome >= 80 will block cookies with SameSite=None unless they are also Secure
    cookieSettings.sameSite = cookieSettings.secure ? 'none' : 'lax';
  }
  if (cookieSettings.secure && !sdk.features.isHTTPS()) {
    // eslint-disable-next-line no-console
    console.warn(
      'The current page is not being served with the HTTPS protocol.\n' +
      'For security reasons, we strongly recommend using HTTPS.\n' +
      'If you cannot use HTTPS, set "cookies.secure" option to false.'
    );
    cookieSettings.secure = false;
  }

  this.options = {
    clientId: args.clientId,
    issuer: util.removeTrailingSlash(args.issuer),
    authorizeUrl: util.removeTrailingSlash(args.authorizeUrl),
    userinfoUrl: util.removeTrailingSlash(args.userinfoUrl),
    tokenUrl: util.removeTrailingSlash(args.tokenUrl),
    revokeUrl: util.removeTrailingSlash(args.revokeUrl),
    logoutUrl: util.removeTrailingSlash(args.logoutUrl),
    pkce: args.pkce === false ? false : true,
    redirectUri: args.redirectUri,
    postLogoutRedirectUri: args.postLogoutRedirectUri,
    responseMode: args.responseMode,
    httpRequestClient: args.httpRequestClient,
    storageUtil: args.storageUtil,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers,
    onSessionExpired: args.onSessionExpired,
    cookies: cookieSettings
  };

  this.userAgent = builderUtil.getUserAgent(args, SDK_VERSION) || 'okta-auth-js-' + SDK_VERSION;

  // Digital clocks will drift over time, so the server
  // can misalign with the time reported by the browser.
  // The maxClockSkew allows relaxing the time-based
  // validation of tokens (in seconds, not milliseconds).
  // It currently defaults to 300, because 5 min is the
  // default maximum tolerance allowed by Kerberos.
  // (https://technet.microsoft.com/en-us/library/cc976357.aspx)
  if (!args.maxClockSkew && args.maxClockSkew !== 0) {
    this.options.maxClockSkew = constants.DEFAULT_MAX_CLOCK_SKEW;
  } else {
    this.options.maxClockSkew = args.maxClockSkew;
  }

  // Give the developer the ability to disable token signature
  // validation.
  this.options.ignoreSignature = !!args.ignoreSignature;

  sdk.session = {
    close: util.bind(session.closeSession, null, sdk),
    exists: util.bind(session.sessionExists, null, sdk),
    get: util.bind(session.getSession, null, sdk),
    refresh: util.bind(session.refreshSession, null, sdk),
    setCookieAndRedirect: util.bind(session.setCookieAndRedirect, null, sdk)
  };

  sdk.tx = {
    status: util.bind(tx.transactionStatus, null, sdk),
    resume: util.bind(tx.resumeTransaction, null, sdk),
    exists: util.bind(tx.transactionExists, null, sdk),
    introspect: util.bind(tx.introspect, null, sdk)
  };

  // This is exposed so we can mock document.cookie in our tests
  sdk.tx.exists._get = function(name) {
    return cookies.get(name);
  };

  // This is exposed so we can mock window.location.href in our tests
  sdk.idToken = {
    authorize: {
      _getLocationHref: function() {
        return window.location.href;
      }
    }
  };

  sdk.token = {
    getWithoutPrompt: util.bind(token.getWithoutPrompt, null, sdk),
    getWithPopup: util.bind(token.getWithPopup, null, sdk),
    getWithRedirect: util.bind(token.getWithRedirect, null, sdk),
    parseFromUrl: util.bind(token.parseFromUrl, null, sdk),
    decode: token.decodeToken,
    revoke: util.bind(token.revokeToken, null, sdk),
    renew: util.bind(token.renewToken, null, sdk),
    getUserInfo: util.bind(token.getUserInfo, null, sdk),
    verify: util.bind(token.verifyToken, null, sdk)
  };

  // This is exposed so we can set window.location in our tests
  sdk.token.getWithRedirect._setLocation = function(url) {
    window.location = url;
  };

  // This is exposed so we can mock getting window.history in our tests
  sdk.token.parseFromUrl._getHistory = function() {
    return window.history;
  };

  // This is exposed so we can mock getting window.location in our tests
  sdk.token.parseFromUrl._getLocation = function() {
    return window.location;
  };

  // This is exposed so we can mock getting window.document in our tests
  sdk.token.parseFromUrl._getDocument = function() {
    return window.document;
  };

  sdk.fingerprint._getUserAgent = function() {
    return navigator.userAgent;
  };

  var isWindowsPhone = /windows phone|iemobile|wpdesktop/i;
  sdk.features.isFingerprintSupported = function() {
    var agent = sdk.fingerprint._getUserAgent();
    return agent && !isWindowsPhone.test(agent);
  };

  sdk.emitter = new Emitter();
  sdk.tokenManager = new TokenManager(sdk, args.tokenManager);
  sdk.tokenManager.on('error', this._onTokenManagerError, this);
}

var proto = OktaAuthBuilder.prototype;
proto._onTokenManagerError = function(error) {
  var code = error.errorCode;
  if (code === 'login_required' && error.accessToken) {
    if (this.options.onSessionExpired) {
      this.options.onSessionExpired();
    } else {
      // eslint-disable-next-line no-console
      console.error('Session has expired or was closed outside the application.');
    }
  }
};

proto.features = {};

proto.features.isPopupPostMessageSupported = function() {
  var isIE8or9 = document.documentMode && document.documentMode < 10;
  if (window.postMessage && !isIE8or9) {
    return true;
  }
  return false;
};

proto.features.isTokenVerifySupported = function() {
  return typeof crypto !== 'undefined' && crypto.subtle && typeof Uint8Array !== 'undefined';
};

proto.features.hasTextEncoder = function() {
  return typeof TextEncoder !== 'undefined';
};

proto.features.isPKCESupported = function() {
  return proto.features.isTokenVerifySupported() && proto.features.hasTextEncoder();
};

proto.features.isHTTPS = function() {
  return window.location.protocol === 'https:';
};

proto.features.isLocalhost = function() {
  return window.location.hostname === 'localhost';
};
// { username, password, (relayState), (context) }
proto.signIn = function (opts) {
  var sdk = this;
  opts = util.clone(opts || {});
  function postToTransaction(options) {
    delete opts.sendFingerprint;
    return tx.postToTransaction(sdk, '/api/v1/authn', opts, options);
  }
  if (!opts.sendFingerprint) {
    return postToTransaction();
  }
  return sdk.fingerprint()
  .then(function(fingerprint) {
    return postToTransaction({
      headers: {
        'X-Device-Fingerprint': fingerprint
      }
    });
  });
};

// Ends the current Okta SSO session without redirecting to Okta.
proto.closeSession = function closeSession() {
  var sdk = this;
  
  // Clear all local tokens
  sdk.tokenManager.clear();

  return sdk.session.close() // DELETE /api/v1/sessions/me
  .catch(function(e) {
    if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
      // Session does not exist or has already been closed
      return;
    }
    throw e;
  });
};

// Revokes the access token for the application session
proto.revokeAccessToken = async function revokeAccessToken(accessToken) {
  var sdk = this;
  if (!accessToken) {
    accessToken = await sdk.tokenManager.get('accessToken');
  }
  // Access token may have been removed. In this case, we will silently succeed.
  if (!accessToken) {
    return Promise.resolve();
  }
  return sdk.token.revoke(accessToken);
};

// Revokes accessToken, clears all local tokens, then redirects to Okta to end the SSO session.
proto.signOut = async function (options) {
  options = util.extend({}, options);

  // postLogoutRedirectUri must be whitelisted in Okta Admin UI
  var defaultUri = window.location.origin;
  var postLogoutRedirectUri = options.postLogoutRedirectUri
    || this.options.postLogoutRedirectUri
    || defaultUri;

  var accessToken = options.accessToken;
  var revokeAccessToken = options.revokeAccessToken !== false;
  var idToken = options.idToken;

  var sdk = this;
  var logoutUrl = oauthUtil.getOAuthUrls(sdk).logoutUrl;

  if (typeof idToken === 'undefined') {
    idToken = await sdk.tokenManager.get('idToken');
  }

  if (revokeAccessToken && typeof accessToken === 'undefined') {
    accessToken = await sdk.tokenManager.get('token');
  }

  // Clear all local tokens
  sdk.tokenManager.clear();

  if (revokeAccessToken && accessToken) {
    await sdk.revokeAccessToken(accessToken);
  }

  // No idToken? This can happen if the storage was cleared.
  // Fallback to XHR signOut, then redirect to the post logout uri
  if (!idToken) {
    return sdk.closeSession() // can throw if the user cannot be signed out
    .then(function() {
      if (postLogoutRedirectUri === defaultUri) {
        window.location.reload();
      } else {
        window.location.assign(postLogoutRedirectUri);
      }
    });
  }

  // logout redirect using the idToken.
  var state = options.state;
  var idTokenHint = idToken.idToken; // a string
  var logoutUri = logoutUrl + '?id_token_hint=' + encodeURIComponent(idTokenHint) +
    '&post_logout_redirect_uri=' + encodeURIComponent(postLogoutRedirectUri);

  // State allows option parameters to be passed to logout redirect uri
  if (state) {
    logoutUri += '&state=' + encodeURIComponent(state);
  }
  
  window.location.assign(logoutUri);
};

builderUtil.addSharedPrototypes(proto);

// { resource, (rel), (requestContext)}
proto.webfinger = function (opts) {
  var url = '/.well-known/webfinger' + util.toQueryParams(opts);
  var options = {
    headers: {
      'Accept': 'application/jrd+json'
    }
  };
  return http.get(this, url, options);
};

proto.fingerprint = function(options) {
  options = options || {};
  var sdk = this;
  if (!sdk.features.isFingerprintSupported()) {
    return Promise.reject(new AuthSdkError('Fingerprinting is not supported on this device'));
  }

  var timeout;
  var iframe;
  var listener;
  var promise = new Promise(function (resolve, reject) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';

    listener = function listener(e) {
      if (!e || !e.data || e.origin !== sdk.getIssuerOrigin()) {
        return;
      }

      try {
        var msg = JSON.parse(e.data);
      } catch (err) {
        return reject(new AuthSdkError('Unable to parse iframe response'));
      }

      if (!msg) { return; }
      if (msg.type === 'FingerprintAvailable') {
        return resolve(msg.fingerprint);
      }
      if (msg.type === 'FingerprintServiceReady') {
        e.source.postMessage(JSON.stringify({
          type: 'GetFingerprint'
        }), e.origin);
      }
    };
    oauthUtil.addListener(window, 'message', listener);

    iframe.src = sdk.getIssuerOrigin() + '/auth/services/devicefingerprint';
    document.body.appendChild(iframe);

    timeout = setTimeout(function() {
      reject(new AuthSdkError('Fingerprinting timed out'));
    }, options.timeout || 15000);
  });

  return promise.finally(function() {
    clearTimeout(timeout);
    oauthUtil.removeListener(window, 'message', listener);
    if (document.body.contains(iframe)) {
      iframe.parentElement.removeChild(iframe);
    }
  });
};

module.exports = builderUtil.buildOktaAuth(OktaAuthBuilder);
