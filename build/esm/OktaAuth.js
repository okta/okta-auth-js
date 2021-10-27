import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
var _excluded = ["originalUri"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import { DEFAULT_MAX_CLOCK_SKEW, REFERRER_PATH_STORAGE_KEY } from './constants';
import * as constants from './constants';
import { transactionStatus, resumeTransaction, transactionExists, introspect, postToTransaction } from './tx';
import PKCE from './oidc/util/pkce';
import { closeSession, sessionExists, getSession, refreshSession, setCookieAndRedirect } from './session';
import { getOAuthUrls, getWithoutPrompt, getWithPopup, getWithRedirect, isLoginRedirect, parseFromUrl, decodeToken, revokeToken, renewToken, renewTokens, renewTokensWithRefresh, getUserInfo, verifyToken, prepareTokenParams, exchangeCodeForTokens, isInteractionRequiredError, isInteractionRequired } from './oidc';
import { isBrowser } from './features';
import * as features from './features';
import browserStorage from './browser/browserStorage';
import { toQueryString, toAbsoluteUrl, clone } from './util';
import { getUserAgent } from './builderUtil';
import { TokenManager } from './TokenManager';
import { get, setRequestHeader } from './http';
import PromiseQueue from './PromiseQueue';
import fingerprint from './browser/fingerprint';
import { AuthStateManager } from './AuthStateManager';
import StorageManager from './StorageManager';
import TransactionManager from './TransactionManager';
import { buildOptions } from './options';
import { interact, introspect as introspectV2, authenticate, cancel, register, recoverPassword, startTransaction, handleInteractionCodeRedirect } from './idx';
import { createGlobalRequestInterceptor, setGlobalRequestInterceptor } from './idx/headers';
import { OktaUserAgent } from './OktaUserAgent';

var Emitter = require('tiny-emitter');

class OktaAuth {
  // keep this field to compatible with released downstream SDK versions
  // TODO: remove in version 6
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-419417
  constructor(args) {
    this.options = buildOptions(args);
    var {
      storageManager,
      cookies,
      storageUtil
    } = this.options;
    this.storageManager = new StorageManager(storageManager, cookies, storageUtil);
    this.transactionManager = new TransactionManager(Object.assign({
      storageManager: this.storageManager
    }, args.transactionManager));
    this._oktaUserAgent = new OktaUserAgent();
    this.tx = {
      status: transactionStatus.bind(null, this),
      resume: resumeTransaction.bind(null, this),
      exists: Object.assign(transactionExists.bind(null, this), {
        _get: name => {
          var storage = storageUtil.storage;
          return storage.get(name);
        }
      }),
      introspect: introspect.bind(null, this)
    };
    this.pkce = {
      DEFAULT_CODE_CHALLENGE_METHOD: PKCE.DEFAULT_CODE_CHALLENGE_METHOD,
      generateVerifier: PKCE.generateVerifier,
      computeChallenge: PKCE.computeChallenge
    }; // Add shims for compatibility, these will be removed in next major version. OKTA-362589

    Object.assign(this.options.storageUtil, {
      getPKCEStorage: this.storageManager.getLegacyPKCEStorage.bind(this.storageManager),
      getHttpCache: this.storageManager.getHttpCache.bind(this.storageManager)
    });
    this._pending = {
      handleLogin: false
    };

    if (isBrowser()) {
      this.options = Object.assign(this.options, {
        redirectUri: toAbsoluteUrl(args.redirectUri, window.location.origin) // allow relative URIs

      });
      this.userAgent = getUserAgent(args, "okta-auth-js/".concat("5.5.0"));
    } else {
      this.userAgent = getUserAgent(args, "okta-auth-js-server/".concat("5.5.0"));
    } // Digital clocks will drift over time, so the server
    // can misalign with the time reported by the browser.
    // The maxClockSkew allows relaxing the time-based
    // validation of tokens (in seconds, not milliseconds).
    // It currently defaults to 300, because 5 min is the
    // default maximum tolerance allowed by Kerberos.
    // (https://technet.microsoft.com/en-us/library/cc976357.aspx)


    if (!args.maxClockSkew && args.maxClockSkew !== 0) {
      this.options.maxClockSkew = DEFAULT_MAX_CLOCK_SKEW;
    } else {
      this.options.maxClockSkew = args.maxClockSkew;
    } // As some end user's devices can have their date 
    // and time incorrectly set, allow for the disabling
    // of the jwt liftetime validation


    this.options.ignoreLifetime = !!args.ignoreLifetime;
    this.session = {
      close: closeSession.bind(null, this),
      exists: sessionExists.bind(null, this),
      get: getSession.bind(null, this),
      refresh: refreshSession.bind(null, this),
      setCookieAndRedirect: setCookieAndRedirect.bind(null, this)
    };
    this._tokenQueue = new PromiseQueue();
    this.token = {
      prepareTokenParams: prepareTokenParams.bind(null, this),
      exchangeCodeForTokens: exchangeCodeForTokens.bind(null, this),
      getWithoutPrompt: getWithoutPrompt.bind(null, this),
      getWithPopup: getWithPopup.bind(null, this),
      getWithRedirect: getWithRedirect.bind(null, this),
      parseFromUrl: parseFromUrl.bind(null, this),
      decode: decodeToken,
      revoke: revokeToken.bind(null, this),
      renew: renewToken.bind(null, this),
      renewTokensWithRefresh: renewTokensWithRefresh.bind(null, this),
      renewTokens: renewTokens.bind(null, this),
      getUserInfo: getUserInfo.bind(null, this),
      verify: verifyToken.bind(null, this),
      isLoginRedirect: isLoginRedirect.bind(null, this)
    }; // Wrap all async token API methods using MethodQueue to avoid issues with concurrency

    var syncMethods = ['decode', 'isLoginRedirect'];
    Object.keys(this.token).forEach(key => {
      if (syncMethods.indexOf(key) >= 0) {
        // sync methods should not be wrapped
        return;
      }

      var method = this.token[key];
      this.token[key] = PromiseQueue.prototype.push.bind(this._tokenQueue, method, null);
    });
    Object.assign(this.token.getWithRedirect, {
      // This is exposed so we can set window.location in our tests
      _setLocation: function _setLocation(url) {
        window.location = url;
      }
    });
    Object.assign(this.token.parseFromUrl, {
      // This is exposed so we can mock getting window.history in our tests
      _getHistory: function _getHistory() {
        return window.history;
      },
      // This is exposed so we can mock getting window.location in our tests
      _getLocation: function _getLocation() {
        return window.location;
      },
      // This is exposed so we can mock getting window.document in our tests
      _getDocument: function _getDocument() {
        return window.document;
      }
    }); // IDX

    this.idx = {
      interact: interact.bind(null, this),
      introspect: introspectV2.bind(null, this),
      authenticate: authenticate.bind(null, this),
      register: register.bind(null, this),
      cancel: cancel.bind(null, this),
      recoverPassword: recoverPassword.bind(null, this),
      handleInteractionCodeRedirect: handleInteractionCodeRedirect.bind(null, this),
      startTransaction: startTransaction.bind(null, this)
    };
    setGlobalRequestInterceptor(createGlobalRequestInterceptor(this)); // to pass custom headers to IDX endpoints
    // HTTP

    this.http = {
      setRequestHeader: setRequestHeader.bind(null, this)
    }; // Fingerprint API

    this.fingerprint = fingerprint.bind(null, this);
    this.emitter = new Emitter(); // TokenManager

    this.tokenManager = new TokenManager(this, args.tokenManager); // AuthStateManager

    this.authStateManager = new AuthStateManager(this);
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
    return isInteractionRequired(this);
  }

  isInteractionRequiredError(error) {
    return isInteractionRequiredError(error);
  }

  signIn(opts) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // TODO: support interaction code flow
      // Authn V1 flow
      return _this.signInWithCredentials(opts);
    })();
  }

  signInWithCredentials(opts) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      opts = clone(opts || {});

      var _postToTransaction = options => {
        options = options || {};
        options.withCredentials = true;
        delete opts.sendFingerprint;
        return postToTransaction(_this2, '/api/v1/authn', opts, options);
      };

      if (!opts.sendFingerprint) {
        return _postToTransaction();
      }

      return _this2.fingerprint().then(function (fingerprint) {
        return _postToTransaction({
          headers: {
            'X-Device-Fingerprint': fingerprint
          }
        });
      });
    })();
  }

  signInWithRedirect() {
    var _arguments = arguments,
        _this3 = this;

    return _asyncToGenerator(function* () {
      var opts = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};

      var {
        originalUri
      } = opts,
          additionalParams = _objectWithoutProperties(opts, _excluded);

      if (_this3._pending.handleLogin) {
        // Don't trigger second round
        return;
      }

      _this3._pending.handleLogin = true;

      try {
        // Trigger default signIn redirect flow
        if (originalUri) {
          _this3.setOriginalUri(originalUri);
        }

        var params = Object.assign({
          // TODO: remove this line when default scopes are changed OKTA-343294
          scopes: _this3.options.scopes || ['openid', 'email', 'profile']
        }, additionalParams);
        yield _this3.token.getWithRedirect(params);
      } finally {
        _this3._pending.handleLogin = false;
      }
    })();
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


  revokeAccessToken(accessToken) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      if (!accessToken) {
        accessToken = (yield _this4.tokenManager.getTokens()).accessToken;

        var accessTokenKey = _this4.tokenManager.getStorageKeyByType('accessToken');

        _this4.tokenManager.remove(accessTokenKey);
      } // Access token may have been removed. In this case, we will silently succeed.


      if (!accessToken) {
        return Promise.resolve(null);
      }

      return _this4.token.revoke(accessToken);
    })();
  } // Revokes the refresh token for the application session


  revokeRefreshToken(refreshToken) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (!refreshToken) {
        refreshToken = (yield _this5.tokenManager.getTokens()).refreshToken;

        var refreshTokenKey = _this5.tokenManager.getStorageKeyByType('refreshToken');

        _this5.tokenManager.remove(refreshTokenKey);
      } // Refresh token may have been removed. In this case, we will silently succeed.


      if (!refreshToken) {
        return Promise.resolve(null);
      }

      return _this5.token.revoke(refreshToken);
    })();
  }

  getSignOutRedirectUrl() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var {
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

    var logoutUrl = getOAuthUrls(this).logoutUrl;
    var idTokenHint = idToken.idToken; // a string

    var logoutUri = logoutUrl + '?id_token_hint=' + encodeURIComponent(idTokenHint);

    if (postLogoutRedirectUri) {
      logoutUri += '&post_logout_redirect_uri=' + encodeURIComponent(postLogoutRedirectUri);
    } // State allows option parameters to be passed to logout redirect uri


    if (state) {
      logoutUri += '&state=' + encodeURIComponent(state);
    }

    return logoutUri;
  } // Revokes refreshToken or accessToken, clears all local tokens, then redirects to Okta to end the SSO session.


  signOut(options) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      options = Object.assign({}, options); // postLogoutRedirectUri must be whitelisted in Okta Admin UI

      var defaultUri = window.location.origin;
      var currentUri = window.location.href;
      var postLogoutRedirectUri = options.postLogoutRedirectUri || _this6.options.postLogoutRedirectUri || defaultUri;
      var accessToken = options.accessToken;
      var refreshToken = options.refreshToken;
      var revokeAccessToken = options.revokeAccessToken !== false;
      var revokeRefreshToken = options.revokeRefreshToken !== false;

      if (revokeRefreshToken && typeof refreshToken === 'undefined') {
        refreshToken = _this6.tokenManager.getTokensSync().refreshToken;
      }

      if (revokeAccessToken && typeof accessToken === 'undefined') {
        accessToken = _this6.tokenManager.getTokensSync().accessToken;
      }

      if (!options.idToken) {
        options.idToken = _this6.tokenManager.getTokensSync().idToken;
      } // Clear all local tokens


      _this6.tokenManager.clear();

      if (revokeRefreshToken && refreshToken) {
        yield _this6.revokeRefreshToken(refreshToken);
      }

      if (revokeAccessToken && accessToken) {
        yield _this6.revokeAccessToken(accessToken);
      }

      var logoutUri = _this6.getSignOutRedirectUrl(_objectSpread(_objectSpread({}, options), {}, {
        postLogoutRedirectUri
      })); // No logoutUri? This can happen if the storage was cleared.
      // Fallback to XHR signOut, then simulate a redirect to the post logout uri


      if (!logoutUri) {
        return _this6.closeSession() // can throw if the user cannot be signed out
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
    })();
  }

  webfinger(opts) {
    var url = '/.well-known/webfinger' + toQueryString(opts);
    var options = {
      headers: {
        'Accept': 'application/jrd+json'
      }
    };
    return get(this, url, options);
  } //
  // Common Methods from downstream SDKs
  //
  // Returns true if both accessToken and idToken are not expired
  // If `autoRenew` option is set, will attempt to renew expired tokens before returning.


  isAuthenticated() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      var {
        accessToken,
        idToken
      } = _this7.tokenManager.getTokensSync();

      var {
        autoRenew,
        autoRemove
      } = _this7.tokenManager.getOptions();

      if (accessToken && _this7.tokenManager.hasExpired(accessToken)) {
        accessToken = null;

        if (autoRenew) {
          accessToken = yield _this7.tokenManager.renew('accessToken');
        } else if (autoRemove) {
          _this7.tokenManager.remove('accessToken');
        }
      }

      if (idToken && _this7.tokenManager.hasExpired(idToken)) {
        idToken = null;

        if (autoRenew) {
          idToken = yield _this7.tokenManager.renew('idToken');
        } else if (autoRemove) {
          _this7.tokenManager.remove('idToken');
        }
      }

      return !!(accessToken && idToken);
    })();
  }

  getUser() {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      var {
        idToken,
        accessToken
      } = _this8.tokenManager.getTokensSync();

      return _this8.token.getUserInfo(accessToken, idToken);
    })();
  }

  getIdToken() {
    var {
      idToken
    } = this.tokenManager.getTokensSync();
    return idToken ? idToken.idToken : undefined;
  }

  getAccessToken() {
    var {
      accessToken
    } = this.tokenManager.getTokensSync();
    return accessToken ? accessToken.accessToken : undefined;
  }

  getRefreshToken() {
    var {
      refreshToken
    } = this.tokenManager.getTokensSync();
    return refreshToken ? refreshToken.refreshToken : undefined;
  }
  /**
   * Store parsed tokens from redirect url
   */


  storeTokensFromRedirect() {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      var {
        tokens
      } = yield _this9.token.parseFromUrl();

      _this9.tokenManager.setTokens(tokens);
    })();
  }

  setOriginalUri(originalUri) {
    var storage = browserStorage.getSessionStorage();
    storage.setItem(REFERRER_PATH_STORAGE_KEY, originalUri);
  }

  getOriginalUri() {
    var storage = browserStorage.getSessionStorage();
    var originalUri = storage.getItem(REFERRER_PATH_STORAGE_KEY);
    return originalUri;
  }

  removeOriginalUri() {
    var storage = browserStorage.getSessionStorage();
    storage.removeItem(REFERRER_PATH_STORAGE_KEY);
  }

  isLoginRedirect() {
    return isLoginRedirect(this);
  }

  handleLoginRedirect(tokens) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      // Store tokens and update AuthState by the emitted events
      if (tokens) {
        _this10.tokenManager.setTokens(tokens);
      } else if (_this10.isLoginRedirect()) {
        yield _this10.storeTokensFromRedirect();
      } else {
        return; // nothing to do
      } // ensure auth state has been updated


      yield _this10.authStateManager.updateAuthState(); // Get and clear originalUri from storage

      var originalUri = _this10.getOriginalUri();

      _this10.removeOriginalUri(); // Redirect to originalUri


      var {
        restoreOriginalUri
      } = _this10.options;

      if (restoreOriginalUri) {
        yield restoreOriginalUri(_this10, originalUri);
      } else {
        window.location.replace(originalUri);
      }
    })();
  }

  isPKCE() {
    return !!this.options.pkce;
  }

  hasResponseType(responseType) {
    var hasResponseType = false;

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
    return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  } // { username, (relayState) }


  unlockAccount(opts) {
    return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  } // { recoveryToken }


  verifyRecoveryToken(opts) {
    return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  }

} // Hoist feature detection functions to static type


OktaAuth.features = OktaAuth.prototype.features = features; // Also hoist values and utility functions for CommonJS users

Object.assign(OktaAuth, {
  constants,
  isInteractionRequiredError
});
export default OktaAuth;
//# sourceMappingURL=OktaAuth.js.map