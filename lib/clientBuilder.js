/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

require('./vendor/polyfills');

var util              = require('./util');
var tx                = require('./tx');
var session           = require('./session');
var cookies           = require('./cookies');
var token             = require('./token');
var AuthSdkError      = require('./errors/AuthSdkError');
var config            = require('./config');
var TokenManager      = require('./TokenManager');

function OktaAuthBuilder(args) {
  var sdk = this;

  if (!args) {
    throw new AuthSdkError('No arguments passed to constructor. ' +
      'Required usage: new OktaAuth(args)');
  }

  if (!args.url) {
    throw new AuthSdkError('No url passed to constructor. ' +
      'Required usage: new OktaAuth({url: "https://sample.okta.com"})');
  }

  this.options = {
    url: util.removeTrailingSlash(args.url),
    clientId: args.clientId,
    issuer: util.removeTrailingSlash(args.issuer),
    authorizeUrl: util.removeTrailingSlash(args.authorizeUrl),
    userinfoUrl: util.removeTrailingSlash(args.userinfoUrl),
    redirectUri: args.redirectUri,
    ajaxRequest: args.ajaxRequest,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers
  };

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
  sdk.tx.exists._getCookie = function(name) {
    return cookies.getCookie(name);
  };

  sdk.idToken = {
    authorize: util.deprecateWrap('Use token.getWithoutPrompt, token.getWithPopup, or token.getWithRedirect ' +
      'instead of idToken.authorize.', util.bind(token.getToken, null, sdk)),
    verify: util.deprecateWrap('Use token.verify instead of idToken.verify', util.bind(token.verifyIdToken, null, sdk)),
    refresh: util.deprecateWrap('Use token.refresh instead of idToken.refresh',
      util.bind(token.refreshIdToken, null, sdk)),
    decode: util.deprecateWrap('Use token.decode instead of idToken.decode', token.decodeToken)
  };

  // This is exposed so we can mock window.location.href in our tests
  sdk.idToken.authorize._getLocationHref = function() {
    return window.location.href;
  };

  sdk.token = {
    getWithoutPrompt: util.bind(token.getWithoutPrompt, null, sdk),
    getWithPopup: util.bind(token.getWithPopup, null, sdk),
    getWithRedirect: util.bind(token.getWithRedirect, null, sdk),
    parseFromUrl: util.bind(token.parseFromUrl, null, sdk),
    decode: token.decodeToken,
    refresh: util.bind(token.refreshToken, null, sdk),
    getUserInfo: util.bind(token.getUserInfo, null, sdk),
    verify: util.bind(token.verifyToken, null, sdk)
  };

  // This is exposed so we can set window.location in our tests
  sdk.token.getWithRedirect._setLocation = function(url) {
    window.location = url;
  };

  // This is exposed so we can mock window.location.hash in our tests
  sdk.token.parseFromUrl._getLocationHash = function(url) {
    return window.location.hash;
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

// { username, password, (relayState), (context) }
proto.signIn = function (opts) {
  return tx.postToTransaction(this, '/api/v1/authn', opts);
};

proto.signOut = function () {
  return this.session.close();
};

// { username, (relayState) }
proto.forgotPassword = function (opts) {
  return tx.postToTransaction(this, '/api/v1/authn/recovery/password', opts);
};

// { username, (relayState) }
proto.unlockAccount = function (opts) {
  return tx.postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
};

// { recoveryToken }
proto.verifyRecoveryToken = function (opts) {
  return tx.postToTransaction(this, '/api/v1/authn/recovery/token', opts);
};

module.exports = function(ajaxRequest) {
  function OktaAuth(args) {
    if (!(this instanceof OktaAuth)) {
      return new OktaAuth(args);
    }
    
    if (args && !args.ajaxRequest) {
      args.ajaxRequest = ajaxRequest;
    }
    util.bind(OktaAuthBuilder, this)(args);
  }
  OktaAuth.prototype = OktaAuthBuilder.prototype;
  OktaAuth.prototype.constructor = OktaAuth;

  return OktaAuth;
};
