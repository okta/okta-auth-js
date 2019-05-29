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

require('../vendor/polyfills');

var AuthSdkError      = require('../errors/AuthSdkError');
var builderUtil       = require('../builderUtil');
var config            = require('../config');
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
  this.options = {
    url: util.removeTrailingSlash(url),
    clientId: args.clientId,
    issuer: util.removeTrailingSlash(args.issuer),
    authorizeUrl: util.removeTrailingSlash(args.authorizeUrl),
    userinfoUrl: util.removeTrailingSlash(args.userinfoUrl),
    tokenUrl: util.removeTrailingSlash(args.tokenUrl),
    grantType: args.grantType,
    redirectUri: args.redirectUri,
    httpRequestClient: args.httpRequestClient,
    storageUtil: args.storageUtil,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers
  };

  if (this.options.grantType === 'authorization_code' && !sdk.features.isPKCESupported()) {
    throw new AuthSdkError('This browser doesn\'t support PKCE');
  }

  this.userAgent = 'okta-auth-js-' + config.SDK_VERSION;

  // Digital clocks will drift over time, so the server
  // can misalign with the time reported by the browser.
  // The maxClockSkew allows relaxing the time-based
  // validation of tokens (in seconds, not milliseconds).
  // It currently defaults to 300, because 5 min is the
  // default maximum tolerance allowed by Kerberos.
  // (https://technet.microsoft.com/en-us/library/cc976357.aspx)
  if (!args.maxClockSkew && args.maxClockSkew !== 0) {
    this.options.maxClockSkew = config.DEFAULT_MAX_CLOCK_SKEW;
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
    exists: util.bind(tx.transactionExists, null, sdk)
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

  sdk.tokenManager = new TokenManager(sdk, args.tokenManager);
}

var proto = OktaAuthBuilder.prototype;

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

proto.features.isPKCESupported = function() {
  return proto.features.isTokenVerifySupported();
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

proto.signOut = function () {
  return this.session.close();
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
