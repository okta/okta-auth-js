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
    url: args.url,
    clientId: args.clientId,
    redirectUri: args.redirectUri,
    ajaxRequest: args.ajaxRequest,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers
  };

  // Remove trailing forward slash from url
  if (this.options.url.slice(-1) === '/') {
    this.options.url = this.options.url.slice(0, -1);
  }

  sdk.session = {
    close: util.bind(session.closeSession, sdk, sdk),
    exists: util.bind(session.sessionExists, sdk, sdk),
    get: util.bind(session.getSession, sdk, sdk),
    refresh: util.bind(session.refreshSession, sdk, sdk),
    setCookieAndRedirect: util.bind(session.setCookieAndRedirect, sdk, sdk)
  };

  sdk.tx = {
    status: util.bind(tx.transactionStatus, sdk, sdk),
    resume: util.bind(tx.resumeTransaction, sdk, sdk),
    exists: util.bind(tx.transactionExists, sdk, sdk)
  };

  // This is exposed so we can mock document.cookie in our tests
  sdk.tx.exists._getCookie = function(name) {
    return cookies.getCookie(name);
  };

  sdk.idToken = {
    authorize: util.bind(token.getIdToken, sdk, sdk), // deprecated for sessionToken and idp flows
    verify: util.bind(token.verifyIdToken, sdk, sdk),
    refresh: util.bind(token.refreshIdToken, sdk, sdk),
    decode: util.bind(token.decodeToken, sdk) // deprecated
  };

  // This is exposed so we can mock window.location.href in our tests
  sdk.idToken.authorize._getLocationHref = function() {
    return window.location.href;
  };

  sdk.token = {
    getWithoutPrompt: util.bind(token.getWithoutPrompt, sdk, sdk),
    getWithPopup: util.bind(token.getWithPopup, sdk, sdk),
    decode: util.bind(token.decodeToken, sdk)
  };
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
