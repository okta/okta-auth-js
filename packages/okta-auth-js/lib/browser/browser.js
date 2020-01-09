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

require('../vendor/polyfills');

var Emitter           = require('tiny-emitter');
var AuthSdkError      = require('../errors/AuthSdkError');
var builderUtil       = require('../builderUtil');
var constants         = require('../constants');
var cookies           = require('./browserStorage').storage;
var http              = require('../http');
var oauthUtil         = require('../oauthUtil');
var Q                 = require('q');
var session           = require('../session');
var token             = require('../token');
var TokenManager      = require('../TokenManager');
var tx                = require('../tx');
var util              = require('../util');

function OktaAuthBuilder(args) {
  var sdk = this;

  var url = builderUtil.getValidUrl(args);
  // OKTA-242989: support for grantType will be removed in 3.0 
  var usePKCE = args.pkce || args.grantType === 'authorization_code';
  this.options = {
    url: util.removeTrailingSlash(url),
    clientId: args.clientId,
    issuer: util.removeTrailingSlash(args.issuer),
    authorizeUrl: util.removeTrailingSlash(args.authorizeUrl),
    userinfoUrl: util.removeTrailingSlash(args.userinfoUrl),
    tokenUrl: util.removeTrailingSlash(args.tokenUrl),
    revokeUrl: util.removeTrailingSlash(args.revokeUrl),
    logoutUrl: util.removeTrailingSlash(args.logoutUrl),
    pkce: usePKCE,
    redirectUri: args.redirectUri,
    postLogoutRedirectUri: args.postLogoutRedirectUri,
    httpRequestClient: args.httpRequestClient,
    storageUtil: args.storageUtil,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers,
    onSessionExpired: args.onSessionExpired,
  };

  if (this.options.pkce && !sdk.features.isPKCESupported()) {
    var errorMessage = 'PKCE requires a modern browser with encryption support running in a secure context.';
    if (!sdk.features.isHTTPS()) {
      errorMessage += '\nThe current page is not being served with HTTPS protocol. Try using HTTPS.';
    }
    if (!sdk.features.hasTextEncoder()) {
      errorMessage += '\n"TextEncoder" is not defined. You may need a polyfill/shim for this browser.';
    }
    throw new AuthSdkError(errorMessage);
  }

  this.userAgent = 'okta-auth-js-' + SDK_VERSION;

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

// Ends the current application session, clearing all local tokens
// Optionally revokes the access token
// Ends the user's Okta session using the API or redirect method
proto.signOut = function (options) {
  options = util.extend({}, options);

  // postLogoutRedirectUri must be whitelisted in Okta Admin UI
  var postLogoutRedirectUri = options.postLogoutRedirectUri || this.options.postLogoutRedirectUri;

  var accessToken = options.accessToken;
  var revokeAccessToken = options.revokeAccessToken;
  var idToken = options.idToken;

  var sdk = this;
  var logoutUrl = oauthUtil.getOAuthUrls(sdk).logoutUrl;

  function getAccessToken() {
    return new Q()
    .then(function() {
      if (revokeAccessToken && typeof accessToken === 'undefined') {
        return sdk.tokenManager.get('token');
      }
      return accessToken;
    });
  }

  function getIdToken() {
    return new Q()
    .then(function() {
      if (postLogoutRedirectUri && typeof idToken === 'undefined') {
        return sdk.tokenManager.get('idToken');
      }
      return idToken;
    });
  }

  function closeSession() {
    return sdk.session.close() // DELETE /api/v1/sessions/me
    .catch(function(e) {
      if (e.name === 'AuthApiError') {
        // Most likely cause is session does not exist or has already been closed
        // Could also be a network error. Nothing we can do here.
        return;
      }
      throw e;
    });
  }

  return Q.allSettled([getAccessToken(), getIdToken()])
    .then(function(tokens) {
      accessToken = tokens[0].value;
      idToken = tokens[1].value;

      // Clear all local tokens
      sdk.tokenManager.clear();

      if (revokeAccessToken && accessToken) {
        return sdk.token.revoke(accessToken)
        .catch(function(e) {
          if (e.name === 'AuthApiError') {
            // Capture and ignore network errors
            return;
          }
          throw e;
        });
      }
    })
    .then(function() {
      // XHR signOut method
      if (!postLogoutRedirectUri) {
        return closeSession();
      }

      // No idToken? This can happen if the storage was cleared.
      // Fallback to XHR signOut, then redirect to the post logout uri
      if (!idToken) {
        return closeSession()
        .catch(function(err) {
          // eslint-disable-next-line no-console
          console.log('Unhandled exception while closing session', err);
        })
        .then(function() {
          window.location.assign(postLogoutRedirectUri);
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
    });
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
    return Q.reject(new AuthSdkError('Fingerprinting is not supported on this device'));
  }

  var deferred = Q.defer();

  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';

  function listener(e) {
    if (!e || !e.data || e.origin !== sdk.options.url) {
      return;
    }

    try {
      var msg = JSON.parse(e.data);
    } catch (err) {
      return deferred.reject(new AuthSdkError('Unable to parse iframe response'));
    }

    if (!msg) { return; }
    if (msg.type === 'FingerprintAvailable') {
      return deferred.resolve(msg.fingerprint);
    }
    if (msg.type === 'FingerprintServiceReady') {
      e.source.postMessage(JSON.stringify({
        type: 'GetFingerprint'
      }), e.origin);
    }
  }
  oauthUtil.addListener(window, 'message', listener);

  iframe.src = sdk.options.url + '/auth/services/devicefingerprint';
  document.body.appendChild(iframe);

  var timeout = setTimeout(function() {
    deferred.reject(new AuthSdkError('Fingerprinting timed out'));
  }, options.timeout || 15000);

  return deferred.promise.fin(function() {
    clearTimeout(timeout);
    oauthUtil.removeListener(window, 'message', listener);
    if (document.body.contains(iframe)) {
      iframe.parentElement.removeChild(iframe);
    }
  });
};

module.exports = builderUtil.buildOktaAuth(OktaAuthBuilder);
