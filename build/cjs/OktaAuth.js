"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.default = void 0;

var constants = _interopRequireWildcard(require("./constants"));

var _tx = require("./tx");

var _pkce = _interopRequireDefault(require("./oidc/util/pkce"));

var _session = require("./session");

var _oidc = require("./oidc");

var features = _interopRequireWildcard(require("./features"));

var _browserStorage = _interopRequireDefault(require("./browser/browserStorage"));

var _util = require("./util");

var _builderUtil = require("./builderUtil");

var _TokenManager = require("./TokenManager");

var _http = require("./http");

var _PromiseQueue = _interopRequireDefault(require("./PromiseQueue"));

var _fingerprint = _interopRequireDefault(require("./browser/fingerprint"));

var _AuthStateManager = require("./AuthStateManager");

var _StorageManager = _interopRequireDefault(require("./StorageManager"));

var _TransactionManager = _interopRequireDefault(require("./TransactionManager"));

var _options = require("./options");

var _idx = require("./idx");

var _headers = require("./idx/headers");

var _OktaUserAgent = require("./OktaUserAgent");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable max-statements */

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
 */

/* SDK_VERSION is defined in webpack config */

/* global window, SDK_VERSION */
const Emitter = require('tiny-emitter');

class OktaAuth {
  // keep this field to compatible with released downstream SDK versions
  // TODO: remove in version 6
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-419417
  constructor(args) {
    this.options = (0, _options.buildOptions)(args);
    const {
      storageManager,
      cookies,
      storageUtil
    } = this.options;
    this.storageManager = new _StorageManager.default(storageManager, cookies, storageUtil);
    this.transactionManager = new _TransactionManager.default(Object.assign({
      storageManager: this.storageManager
    }, args.transactionManager));
    this._oktaUserAgent = new _OktaUserAgent.OktaUserAgent();
    this.tx = {
      status: _tx.transactionStatus.bind(null, this),
      resume: _tx.resumeTransaction.bind(null, this),
      exists: Object.assign(_tx.transactionExists.bind(null, this), {
        _get: name => {
          const storage = storageUtil.storage;
          return storage.get(name);
        }
      }),
      introspect: _tx.introspect.bind(null, this)
    };
    this.pkce = {
      DEFAULT_CODE_CHALLENGE_METHOD: _pkce.default.DEFAULT_CODE_CHALLENGE_METHOD,
      generateVerifier: _pkce.default.generateVerifier,
      computeChallenge: _pkce.default.computeChallenge
    }; // Add shims for compatibility, these will be removed in next major version. OKTA-362589

    Object.assign(this.options.storageUtil, {
      getPKCEStorage: this.storageManager.getLegacyPKCEStorage.bind(this.storageManager),
      getHttpCache: this.storageManager.getHttpCache.bind(this.storageManager)
    });
    this._pending = {
      handleLogin: false
    };

    if ((0, features.isBrowser)()) {
      this.options = Object.assign(this.options, {
        redirectUri: (0, _util.toAbsoluteUrl)(args.redirectUri, window.location.origin) // allow relative URIs

      });
      this.userAgent = (0, _builderUtil.getUserAgent)(args, `okta-auth-js/${"5.5.0"}`);
    } else {
      this.userAgent = (0, _builderUtil.getUserAgent)(args, `okta-auth-js-server/${"5.5.0"}`);
    } // Digital clocks will drift over time, so the server
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
    } // As some end user's devices can have their date 
    // and time incorrectly set, allow for the disabling
    // of the jwt liftetime validation


    this.options.ignoreLifetime = !!args.ignoreLifetime;
    this.session = {
      close: _session.closeSession.bind(null, this),
      exists: _session.sessionExists.bind(null, this),
      get: _session.getSession.bind(null, this),
      refresh: _session.refreshSession.bind(null, this),
      setCookieAndRedirect: _session.setCookieAndRedirect.bind(null, this)
    };
    this._tokenQueue = new _PromiseQueue.default();
    this.token = {
      prepareTokenParams: _oidc.prepareTokenParams.bind(null, this),
      exchangeCodeForTokens: _oidc.exchangeCodeForTokens.bind(null, this),
      getWithoutPrompt: _oidc.getWithoutPrompt.bind(null, this),
      getWithPopup: _oidc.getWithPopup.bind(null, this),
      getWithRedirect: _oidc.getWithRedirect.bind(null, this),
      parseFromUrl: _oidc.parseFromUrl.bind(null, this),
      decode: _oidc.decodeToken,
      revoke: _oidc.revokeToken.bind(null, this),
      renew: _oidc.renewToken.bind(null, this),
      renewTokensWithRefresh: _oidc.renewTokensWithRefresh.bind(null, this),
      renewTokens: _oidc.renewTokens.bind(null, this),
      getUserInfo: _oidc.getUserInfo.bind(null, this),
      verify: _oidc.verifyToken.bind(null, this),
      isLoginRedirect: _oidc.isLoginRedirect.bind(null, this)
    }; // Wrap all async token API methods using MethodQueue to avoid issues with concurrency

    const syncMethods = ['decode', 'isLoginRedirect'];
    Object.keys(this.token).forEach(key => {
      if (syncMethods.indexOf(key) >= 0) {
        // sync methods should not be wrapped
        return;
      }

      var method = this.token[key];
      this.token[key] = _PromiseQueue.default.prototype.push.bind(this._tokenQueue, method, null);
    });
    Object.assign(this.token.getWithRedirect, {
      // This is exposed so we can set window.location in our tests
      _setLocation: function (url) {
        window.location = url;
      }
    });
    Object.assign(this.token.parseFromUrl, {
      // This is exposed so we can mock getting window.history in our tests
      _getHistory: function () {
        return window.history;
      },
      // This is exposed so we can mock getting window.location in our tests
      _getLocation: function () {
        return window.location;
      },
      // This is exposed so we can mock getting window.document in our tests
      _getDocument: function () {
        return window.document;
      }
    }); // IDX

    this.idx = {
      interact: _idx.interact.bind(null, this),
      introspect: _idx.introspect.bind(null, this),
      authenticate: _idx.authenticate.bind(null, this),
      register: _idx.register.bind(null, this),
      cancel: _idx.cancel.bind(null, this),
      recoverPassword: _idx.recoverPassword.bind(null, this),
      handleInteractionCodeRedirect: _idx.handleInteractionCodeRedirect.bind(null, this),
      startTransaction: _idx.startTransaction.bind(null, this)
    };
    (0, _headers.setGlobalRequestInterceptor)((0, _headers.createGlobalRequestInterceptor)(this)); // to pass custom headers to IDX endpoints
    // HTTP

    this.http = {
      setRequestHeader: _http.setRequestHeader.bind(null, this)
    }; // Fingerprint API

    this.fingerprint = _fingerprint.default.bind(null, this);
    this.emitter = new Emitter(); // TokenManager

    this.tokenManager = new _TokenManager.TokenManager(this, args.tokenManager); // AuthStateManager

    this.authStateManager = new _AuthStateManager.AuthStateManager(this);
  }

  start() {
    this.tokenManager.start();

    if (!this.token.isLoginRedirect()) {
      this.authStateManager.updateAuthState();
    }
  }

  stop() {
    this.tokenManager.stop();
  } // ES6 module users can use named exports to access all symbols
  // CommonJS module users (CDN) need all exports on this object
  // Utility methods for interaction code flow


  isInteractionRequired() {
    return (0, _oidc.isInteractionRequired)(this);
  }

  isInteractionRequiredError(error) {
    return (0, _oidc.isInteractionRequiredError)(error);
  }

  async signIn(opts) {
    // TODO: support interaction code flow
    // Authn V1 flow
    return this.signInWithCredentials(opts);
  }

  async signInWithCredentials(opts) {
    opts = (0, _util.clone)(opts || {});

    const _postToTransaction = options => {
      options = options || {};
      options.withCredentials = true;
      delete opts.sendFingerprint;
      return (0, _tx.postToTransaction)(this, '/api/v1/authn', opts, options);
    };

    if (!opts.sendFingerprint) {
      return _postToTransaction();
    }

    return this.fingerprint().then(function (fingerprint) {
      return _postToTransaction({
        headers: {
          'X-Device-Fingerprint': fingerprint
        }
      });
    });
  }

  async signInWithRedirect(opts = {}) {
    const {
      originalUri,
      ...additionalParams
    } = opts;

    if (this._pending.handleLogin) {
      // Don't trigger second round
      return;
    }

    this._pending.handleLogin = true;

    try {
      // Trigger default signIn redirect flow
      if (originalUri) {
        this.setOriginalUri(originalUri);
      }

      const params = Object.assign({
        // TODO: remove this line when default scopes are changed OKTA-343294
        scopes: this.options.scopes || ['openid', 'email', 'profile']
      }, additionalParams);
      await this.token.getWithRedirect(params);
    } finally {
      this._pending.handleLogin = false;
    }
  } // Ends the current Okta SSO session without redirecting to Okta.


  closeSession() {
    // Clear all local tokens
    this.tokenManager.clear();
    return this.session.close() // DELETE /api/v1/sessions/me
    .catch(function (e) {
      if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
        // Session does not exist or has already been closed
        return null;
      }

      throw e;
    });
  } // Revokes the access token for the application session


  async revokeAccessToken(accessToken) {
    if (!accessToken) {
      accessToken = (await this.tokenManager.getTokens()).accessToken;
      const accessTokenKey = this.tokenManager.getStorageKeyByType('accessToken');
      this.tokenManager.remove(accessTokenKey);
    } // Access token may have been removed. In this case, we will silently succeed.


    if (!accessToken) {
      return Promise.resolve(null);
    }

    return this.token.revoke(accessToken);
  } // Revokes the refresh token for the application session


  async revokeRefreshToken(refreshToken) {
    if (!refreshToken) {
      refreshToken = (await this.tokenManager.getTokens()).refreshToken;
      const refreshTokenKey = this.tokenManager.getStorageKeyByType('refreshToken');
      this.tokenManager.remove(refreshTokenKey);
    } // Refresh token may have been removed. In this case, we will silently succeed.


    if (!refreshToken) {
      return Promise.resolve(null);
    }

    return this.token.revoke(refreshToken);
  }

  getSignOutRedirectUrl(options = {}) {
    let {
      idToken,
      postLogoutRedirectUri,
      state
    } = options;

    if (!idToken) {
      idToken = this.tokenManager.getTokensSync().idToken;
    }

    if (!idToken) {
      return '';
    }

    if (!postLogoutRedirectUri) {
      postLogoutRedirectUri = this.options.postLogoutRedirectUri;
    }

    const logoutUrl = (0, _oidc.getOAuthUrls)(this).logoutUrl;
    const idTokenHint = idToken.idToken; // a string

    let logoutUri = logoutUrl + '?id_token_hint=' + encodeURIComponent(idTokenHint);

    if (postLogoutRedirectUri) {
      logoutUri += '&post_logout_redirect_uri=' + encodeURIComponent(postLogoutRedirectUri);
    } // State allows option parameters to be passed to logout redirect uri


    if (state) {
      logoutUri += '&state=' + encodeURIComponent(state);
    }

    return logoutUri;
  } // Revokes refreshToken or accessToken, clears all local tokens, then redirects to Okta to end the SSO session.


  async signOut(options) {
    options = Object.assign({}, options); // postLogoutRedirectUri must be whitelisted in Okta Admin UI

    var defaultUri = window.location.origin;
    var currentUri = window.location.href;
    var postLogoutRedirectUri = options.postLogoutRedirectUri || this.options.postLogoutRedirectUri || defaultUri;
    var accessToken = options.accessToken;
    var refreshToken = options.refreshToken;
    var revokeAccessToken = options.revokeAccessToken !== false;
    var revokeRefreshToken = options.revokeRefreshToken !== false;

    if (revokeRefreshToken && typeof refreshToken === 'undefined') {
      refreshToken = this.tokenManager.getTokensSync().refreshToken;
    }

    if (revokeAccessToken && typeof accessToken === 'undefined') {
      accessToken = this.tokenManager.getTokensSync().accessToken;
    }

    if (!options.idToken) {
      options.idToken = this.tokenManager.getTokensSync().idToken;
    } // Clear all local tokens


    this.tokenManager.clear();

    if (revokeRefreshToken && refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    if (revokeAccessToken && accessToken) {
      await this.revokeAccessToken(accessToken);
    }

    const logoutUri = this.getSignOutRedirectUrl({ ...options,
      postLogoutRedirectUri
    }); // No logoutUri? This can happen if the storage was cleared.
    // Fallback to XHR signOut, then simulate a redirect to the post logout uri

    if (!logoutUri) {
      return this.closeSession() // can throw if the user cannot be signed out
      .then(function () {
        if (postLogoutRedirectUri === currentUri) {
          window.location.reload(); // force a hard reload if URI is not changing
        } else {
          window.location.assign(postLogoutRedirectUri);
        }
      });
    } else {
      // Flow ends with logout redirect
      window.location.assign(logoutUri);
    }
  }

  webfinger(opts) {
    var url = '/.well-known/webfinger' + (0, _util.toQueryString)(opts);
    var options = {
      headers: {
        'Accept': 'application/jrd+json'
      }
    };
    return (0, _http.get)(this, url, options);
  } //
  // Common Methods from downstream SDKs
  //
  // Returns true if both accessToken and idToken are not expired
  // If `autoRenew` option is set, will attempt to renew expired tokens before returning.


  async isAuthenticated() {
    let {
      accessToken,
      idToken
    } = this.tokenManager.getTokensSync();
    const {
      autoRenew,
      autoRemove
    } = this.tokenManager.getOptions();

    if (accessToken && this.tokenManager.hasExpired(accessToken)) {
      accessToken = null;

      if (autoRenew) {
        accessToken = await this.tokenManager.renew('accessToken');
      } else if (autoRemove) {
        this.tokenManager.remove('accessToken');
      }
    }

    if (idToken && this.tokenManager.hasExpired(idToken)) {
      idToken = null;

      if (autoRenew) {
        idToken = await this.tokenManager.renew('idToken');
      } else if (autoRemove) {
        this.tokenManager.remove('idToken');
      }
    }

    return !!(accessToken && idToken);
  }

  async getUser() {
    const {
      idToken,
      accessToken
    } = this.tokenManager.getTokensSync();
    return this.token.getUserInfo(accessToken, idToken);
  }

  getIdToken() {
    const {
      idToken
    } = this.tokenManager.getTokensSync();
    return idToken ? idToken.idToken : undefined;
  }

  getAccessToken() {
    const {
      accessToken
    } = this.tokenManager.getTokensSync();
    return accessToken ? accessToken.accessToken : undefined;
  }

  getRefreshToken() {
    const {
      refreshToken
    } = this.tokenManager.getTokensSync();
    return refreshToken ? refreshToken.refreshToken : undefined;
  }
  /**
   * Store parsed tokens from redirect url
   */


  async storeTokensFromRedirect() {
    const {
      tokens
    } = await this.token.parseFromUrl();
    this.tokenManager.setTokens(tokens);
  }

  setOriginalUri(originalUri) {
    const storage = _browserStorage.default.getSessionStorage();

    storage.setItem(constants.REFERRER_PATH_STORAGE_KEY, originalUri);
  }

  getOriginalUri() {
    const storage = _browserStorage.default.getSessionStorage();

    const originalUri = storage.getItem(constants.REFERRER_PATH_STORAGE_KEY);
    return originalUri;
  }

  removeOriginalUri() {
    const storage = _browserStorage.default.getSessionStorage();

    storage.removeItem(constants.REFERRER_PATH_STORAGE_KEY);
  }

  isLoginRedirect() {
    return (0, _oidc.isLoginRedirect)(this);
  }

  async handleLoginRedirect(tokens) {
    // Store tokens and update AuthState by the emitted events
    if (tokens) {
      this.tokenManager.setTokens(tokens);
    } else if (this.isLoginRedirect()) {
      await this.storeTokensFromRedirect();
    } else {
      return; // nothing to do
    } // ensure auth state has been updated


    await this.authStateManager.updateAuthState(); // Get and clear originalUri from storage

    const originalUri = this.getOriginalUri();
    this.removeOriginalUri(); // Redirect to originalUri

    const {
      restoreOriginalUri
    } = this.options;

    if (restoreOriginalUri) {
      await restoreOriginalUri(this, originalUri);
    } else {
      window.location.replace(originalUri);
    }
  }

  isPKCE() {
    return !!this.options.pkce;
  }

  hasResponseType(responseType) {
    let hasResponseType = false;

    if (Array.isArray(this.options.responseType) && this.options.responseType.length) {
      hasResponseType = this.options.responseType.indexOf(responseType) >= 0;
    } else {
      hasResponseType = this.options.responseType === responseType;
    }

    return hasResponseType;
  }

  isAuthorizationCodeFlow() {
    return this.hasResponseType('code');
  } // { username, password, (relayState), (context) }
  // signIn(opts: SignInWithCredentialsOptions): Promise<AuthTransaction> {
  //   return postToTransaction(this, '/api/v1/authn', opts);
  // }


  getIssuerOrigin() {
    // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
    return this.options.issuer.split('/oauth2/')[0];
  } // { username, (relayState) }


  forgotPassword(opts) {
    return (0, _tx.postToTransaction)(this, '/api/v1/authn/recovery/password', opts);
  } // { username, (relayState) }


  unlockAccount(opts) {
    return (0, _tx.postToTransaction)(this, '/api/v1/authn/recovery/unlock', opts);
  } // { recoveryToken }


  verifyRecoveryToken(opts) {
    return (0, _tx.postToTransaction)(this, '/api/v1/authn/recovery/token', opts);
  }

} // Hoist feature detection functions to static type


OktaAuth.features = OktaAuth.prototype.features = features; // Also hoist values and utility functions for CommonJS users

Object.assign(OktaAuth, {
  constants,
  isInteractionRequiredError: _oidc.isInteractionRequiredError
});
var _default = OktaAuth;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=OktaAuth.js.map