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

import { 
  DEFAULT_MAX_CLOCK_SKEW, 
  REFERRER_PATH_STORAGE_KEY
} from './constants';
import * as constants from './constants';
import {
  OktaAuth as SDKInterface,
  OktaAuthOptions, 
  AccessToken, 
  IDToken,
  RefreshToken,
  TokenAPI, 
  FeaturesAPI, 
  SignoutAPI, 
  FingerprintAPI,
  UserClaims, 
  SigninWithRedirectOptions,
  SigninWithCredentialsOptions,
  SignoutOptions,
  Tokens,
  ForgotPasswordOptions,
  VerifyRecoveryTokenOptions,
  TransactionAPI,
  SessionAPI,
  SigninAPI,
  PkceAPI,
  SigninOptions,
  IdxAPI,
  SignoutRedirectUrlOptions,
  HttpAPI,
} from './types';
import {
  transactionStatus,
  resumeTransaction,
  transactionExists,
  introspect,
  postToTransaction,
  AuthTransaction
} from './tx';
import PKCE from './oidc/util/pkce';
import {
  closeSession,
  sessionExists,
  getSession,
  refreshSession,
  setCookieAndRedirect
} from './session';
import {
  getOAuthUrls,
  getWithoutPrompt,
  getWithPopup,
  getWithRedirect,
  isLoginRedirect,
  parseFromUrl,
  decodeToken,
  revokeToken,
  renewToken,
  renewTokens,
  renewTokensWithRefresh,
  getUserInfo,
  verifyToken,
  prepareTokenParams,
  exchangeCodeForTokens,
  isInteractionRequiredError,
  isInteractionRequired,
} from './oidc';
import { isBrowser } from './features';
import * as features from './features';
import browserStorage from './browser/browserStorage';
import { 
  toQueryString, 
  toAbsoluteUrl,
  clone,
  isEmailVerifyCallback,
  EmailVerifyCallbackResponse,
  parseEmailVerifyCallback
} from './util';
import { getUserAgent } from './builderUtil';
import { TokenManager } from './TokenManager';
import { get, setRequestHeader } from './http';
import PromiseQueue from './PromiseQueue';
import fingerprint from './browser/fingerprint';
import { AuthStateManager } from './AuthStateManager';
import StorageManager from './StorageManager';
import TransactionManager from './TransactionManager';
import { buildOptions } from './options';
import {
  interact,
  introspect as introspectV2,
  authenticate,
  cancel,
  register,
  recoverPassword,
  startTransaction,
  handleInteractionCodeRedirect,
} from './idx';
import { createGlobalRequestInterceptor, setGlobalRequestInterceptor } from './idx/headers';
import { OktaUserAgent } from './OktaUserAgent';
import { parseOAuthResponseFromUrl } from './oidc/parseFromUrl';

const Emitter = require('tiny-emitter');

class OktaAuth implements SDKInterface, SigninAPI, SignoutAPI {
  options: OktaAuthOptions;
  storageManager: StorageManager;
  transactionManager: TransactionManager;
  tx: TransactionAPI;
  idx: IdxAPI;
  // keep this field to compatible with released downstream SDK versions
  // TODO: remove in version 6
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-419417
  userAgent: string;
  session: SessionAPI;
  pkce: PkceAPI;
  static features: FeaturesAPI;
  features: FeaturesAPI;
  token: TokenAPI;
  _tokenQueue: PromiseQueue;
  emitter: typeof Emitter;
  tokenManager: TokenManager;
  authStateManager: AuthStateManager;
  http: HttpAPI;
  fingerprint: FingerprintAPI;
  _oktaUserAgent: OktaUserAgent;
  _pending: { handleLogin: boolean };
  constructor(args: OktaAuthOptions) {
    const options = this.options = buildOptions(args);
    this.storageManager = new StorageManager(options.storageManager, options.cookies, options.storageUtil);
    this.transactionManager = new TransactionManager(Object.assign({
      storageManager: this.storageManager,
    }, options.transactionManager));
    this._oktaUserAgent = new OktaUserAgent();
  
    this.tx = {
      status: transactionStatus.bind(null, this),
      resume: resumeTransaction.bind(null, this),
      exists: Object.assign(transactionExists.bind(null, this), {
        _get: (name) => {
          const storage = options.storageUtil.storage;
          return storage.get(name);
        }
      }),
      introspect: introspect.bind(null, this)
    };

    this.pkce = {
      DEFAULT_CODE_CHALLENGE_METHOD: PKCE.DEFAULT_CODE_CHALLENGE_METHOD,
      generateVerifier: PKCE.generateVerifier,
      computeChallenge: PKCE.computeChallenge
    };

    // Add shims for compatibility, these will be removed in next major version. OKTA-362589
    Object.assign(this.options.storageUtil, {
      getPKCEStorage: this.storageManager.getLegacyPKCEStorage.bind(this.storageManager),
      getHttpCache: this.storageManager.getHttpCache.bind(this.storageManager),
    });

    this._pending = { handleLogin: false };

    if (isBrowser()) {
      this.options = Object.assign(this.options, {
        redirectUri: toAbsoluteUrl(args.redirectUri, window.location.origin), // allow relative URIs
      });
      this.userAgent = getUserAgent(args, `okta-auth-js/${SDK_VERSION}`);
    } else {
      this.userAgent = getUserAgent(args, `okta-auth-js-server/${SDK_VERSION}`);
    }

    // Digital clocks will drift over time, so the server
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
    }

    // As some end user's devices can have their date 
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
    };
    // Wrap all async token API methods using MethodQueue to avoid issues with concurrency
    const syncMethods = ['decode', 'isLoginRedirect'];
    Object.keys(this.token).forEach(key => {
      if (syncMethods.indexOf(key) >= 0) { // sync methods should not be wrapped
        return;
      }
      var method = this.token[key];
      this.token[key] = PromiseQueue.prototype.push.bind(this._tokenQueue, method, null);
    });
    
    Object.assign(this.token.getWithRedirect, {
      // This is exposed so we can set window.location in our tests
      _setLocation: function(url) {
        window.location = url;
      }
    });
    Object.assign(this.token.parseFromUrl, {
      // This is exposed so we can mock getting window.history in our tests
      _getHistory: function() {
        return window.history;
      },

      // This is exposed so we can mock getting window.location in our tests
      _getLocation: function() {
        return window.location;
      },

      // This is exposed so we can mock getting window.document in our tests
      _getDocument: function() {
        return window.document;
      }
    });

    // IDX
    this.idx = {
      interact: interact.bind(null, this),
      introspect: introspectV2.bind(null, this),
      authenticate: authenticate.bind(null, this),
      register: register.bind(null, this),
      cancel: cancel.bind(null, this),
      recoverPassword: recoverPassword.bind(null, this),
      handleInteractionCodeRedirect: handleInteractionCodeRedirect.bind(null, this),
      startTransaction: startTransaction.bind(null, this),
    };
    setGlobalRequestInterceptor(createGlobalRequestInterceptor(this)); // to pass custom headers to IDX endpoints

    // HTTP
    this.http = {
      setRequestHeader: setRequestHeader.bind(null, this)
    };

    // Fingerprint API
    this.fingerprint = fingerprint.bind(null, this);

    this.emitter = new Emitter();

    // TokenManager
    this.tokenManager = new TokenManager(this, args.tokenManager);

    // AuthStateManager
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
  }

  setHeaders(headers) {
    this.options.headers = Object.assign({}, this.options.headers, headers);
  }

  // ES6 module users can use named exports to access all symbols
  // CommonJS module users (CDN) need all exports on this object

  // Utility methods for interaction code flow
  isInteractionRequired(hashOrSearch?: string): boolean {
    return isInteractionRequired(this, hashOrSearch);
  }

  isInteractionRequiredError(error: Error): boolean {
    return isInteractionRequiredError(error);
  }

  // Utility methods for email verify callback
  isEmailVerifyCallback(urlPath: string): boolean {
    return isEmailVerifyCallback(urlPath);
  }

  parseEmailVerifyCallback(urlPath: string): EmailVerifyCallbackResponse {
    return parseEmailVerifyCallback(urlPath);
  }

  async signIn(opts: SigninOptions): Promise<AuthTransaction> {
    // TODO: support interaction code flow
    // Authn V1 flow
    return this.signInWithCredentials(opts as SigninWithCredentialsOptions);
  }

  async signInWithCredentials(opts: SigninWithCredentialsOptions): Promise<AuthTransaction> {
    opts = clone(opts || {});
    const _postToTransaction = (options?) => {
      delete opts.sendFingerprint;
      return postToTransaction(this, '/api/v1/authn', opts, options);
    };
    if (!opts.sendFingerprint) {
      return _postToTransaction();
    }
    return this.fingerprint()
    .then(function(fingerprint) {
      return _postToTransaction({
        headers: {
          'X-Device-Fingerprint': fingerprint
        }
      });
    });
  }

  async signInWithRedirect(opts: SigninWithRedirectOptions = {}) {
    const { originalUri, ...additionalParams } = opts;
    if(this._pending.handleLogin) { 
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
  }
  
  // Ends the current Okta SSO session without redirecting to Okta.
  closeSession(): Promise<object> {
    // Clear all local tokens
    this.tokenManager.clear();
  
    return this.session.close() // DELETE /api/v1/sessions/me
    .catch(function(e) {
      if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
        // Session does not exist or has already been closed
        return null;
      }
      throw e;
    });
  }
  
  // Revokes the access token for the application session
  async revokeAccessToken(accessToken?: AccessToken): Promise<object> {
    if (!accessToken) {
      accessToken = (await this.tokenManager.getTokens()).accessToken as AccessToken;
      const accessTokenKey = this.tokenManager.getStorageKeyByType('accessToken');
      this.tokenManager.remove(accessTokenKey);
    }
    // Access token may have been removed. In this case, we will silently succeed.
    if (!accessToken) {
      return Promise.resolve(null);
    }
    return this.token.revoke(accessToken);
  }

  // Revokes the refresh token for the application session
  async revokeRefreshToken(refreshToken?: RefreshToken): Promise<object> {
    if (!refreshToken) {
      refreshToken = (await this.tokenManager.getTokens()).refreshToken as RefreshToken;
      const refreshTokenKey = this.tokenManager.getStorageKeyByType('refreshToken');
      this.tokenManager.remove(refreshTokenKey);
    }
    // Refresh token may have been removed. In this case, we will silently succeed.
    if (!refreshToken) {
      return Promise.resolve(null);
    }
    return this.token.revoke(refreshToken);
  }

  getSignOutRedirectUrl(options: SignoutRedirectUrlOptions = {}) {
    let {
      idToken,
      postLogoutRedirectUri,
      state,
    } = options;
    if (!idToken) {
      idToken = this.tokenManager.getTokensSync().idToken as IDToken;
    }
    if (!idToken) {
      return '';
    }
    if (!postLogoutRedirectUri) {
      postLogoutRedirectUri = this.options.postLogoutRedirectUri;
    }

    const logoutUrl = getOAuthUrls(this).logoutUrl;
    const idTokenHint = idToken.idToken; // a string
    let logoutUri = logoutUrl + '?id_token_hint=' + encodeURIComponent(idTokenHint);
    if (postLogoutRedirectUri) {
      logoutUri += '&post_logout_redirect_uri=' + encodeURIComponent(postLogoutRedirectUri);
    } 
    // State allows option parameters to be passed to logout redirect uri
    if (state) {
      logoutUri += '&state=' + encodeURIComponent(state);
    }

    return logoutUri;
  }

  // Revokes refreshToken or accessToken, clears all local tokens, then redirects to Okta to end the SSO session.
  async signOut(options?: SignoutOptions) {
    options = Object.assign({}, options);
  
    // postLogoutRedirectUri must be whitelisted in Okta Admin UI
    var defaultUri = window.location.origin;
    var currentUri = window.location.href;
    var postLogoutRedirectUri = options.postLogoutRedirectUri
      || this.options.postLogoutRedirectUri
      || defaultUri;
  
    var accessToken = options.accessToken;
    var refreshToken = options.refreshToken;
    var revokeAccessToken = options.revokeAccessToken !== false;
    var revokeRefreshToken = options.revokeRefreshToken !== false;
  
    if (revokeRefreshToken && typeof refreshToken === 'undefined') {
      refreshToken = this.tokenManager.getTokensSync().refreshToken as RefreshToken;
    }

    if (revokeAccessToken && typeof accessToken === 'undefined') {
      accessToken = this.tokenManager.getTokensSync().accessToken as AccessToken;
    }
  
    if (!options.idToken) {
      options.idToken = this.tokenManager.getTokensSync().idToken as IDToken;
    }

    // Clear all local tokens
    this.tokenManager.clear();

    if (revokeRefreshToken && refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    if (revokeAccessToken && accessToken) {
      await this.revokeAccessToken(accessToken);
    }

    const logoutUri = this.getSignOutRedirectUrl({ ...options, postLogoutRedirectUri });
    // No logoutUri? This can happen if the storage was cleared.
    // Fallback to XHR signOut, then simulate a redirect to the post logout uri
    if (!logoutUri) {
      return this.closeSession() // can throw if the user cannot be signed out
      .then(function() {
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

  webfinger(opts): Promise<object> {
    var url = '/.well-known/webfinger' + toQueryString(opts);
    var options = {
      headers: {
        'Accept': 'application/jrd+json'
      }
    };
    return get(this, url, options);
  }

  //
  // Common Methods from downstream SDKs
  //

  // Returns true if both accessToken and idToken are not expired
  // If `autoRenew` option is set, will attempt to renew expired tokens before returning.
  async isAuthenticated(): Promise<boolean> {

    let { accessToken, idToken } = this.tokenManager.getTokensSync();
    const { autoRenew, autoRemove } = this.tokenManager.getOptions();

    if (accessToken && this.tokenManager.hasExpired(accessToken)) {
      accessToken = null;
      if (autoRenew) {
        accessToken = await this.tokenManager.renew('accessToken') as AccessToken;
      } else if (autoRemove) {
        this.tokenManager.remove('accessToken');
      }
    }

    if (idToken && this.tokenManager.hasExpired(idToken)) {
      idToken = null;
      if (autoRenew) {
        idToken = await this.tokenManager.renew('idToken') as IDToken;
      } else if (autoRemove) {
        this.tokenManager.remove('idToken');
      }
    }

    return !!(accessToken && idToken);
  }

  async getUser(): Promise<UserClaims> {
    const { idToken, accessToken } = this.tokenManager.getTokensSync();
    return this.token.getUserInfo(accessToken, idToken);
  }

  getIdToken(): string | undefined {
    const { idToken } = this.tokenManager.getTokensSync();
    return idToken ? idToken.idToken : undefined;
  }

  getAccessToken(): string | undefined {
    const { accessToken } = this.tokenManager.getTokensSync();
    return accessToken ? accessToken.accessToken : undefined;
  }

  getRefreshToken(): string | undefined {
    const { refreshToken } = this.tokenManager.getTokensSync();
    return refreshToken ? refreshToken.refreshToken : undefined;
  }

  /**
   * Store parsed tokens from redirect url
   */
  async storeTokensFromRedirect(): Promise<void> {
    const { tokens } = await this.token.parseFromUrl();
    this.tokenManager.setTokens(tokens);
  }

  setOriginalUri(originalUri: string, state?: string): void {
    // always store in session storage
    const sessionStorage = browserStorage.getSessionStorage();
    sessionStorage.setItem(REFERRER_PATH_STORAGE_KEY, originalUri);

    // to support multi-tab flows, set a state in constructor or pass as param
    state = state || this.options.state;
    if (state) {
      const sharedStorage = this.storageManager.getOriginalUriStorage();
      sharedStorage.setItem(state, originalUri);
    }
  }

  getOriginalUri(state?: string): string {
    // Prefer shared storage (if state is available)
    state = state || this.options.state;
    if (state) {
      const sharedStorage = this.storageManager.getOriginalUriStorage();
      const originalUri = sharedStorage.getItem(state);
      if (originalUri) {
        return originalUri;
      }
    }

    // Try to load from session storage
    const storage = browserStorage.getSessionStorage();
    return storage ? storage.getItem(REFERRER_PATH_STORAGE_KEY) : undefined;
  }

  removeOriginalUri(state?: string): void {
    // Remove from sessionStorage
    const storage = browserStorage.getSessionStorage();
    storage.removeItem(REFERRER_PATH_STORAGE_KEY);

    // Also remove from shared storage
    state = state || this.options.state;
    if (state) {
      const sharedStorage = this.storageManager.getOriginalUriStorage();
      sharedStorage.removeItem(state);
    }
  }

  isLoginRedirect(): boolean {
    return isLoginRedirect(this);
  }

  async handleLoginRedirect(tokens?: Tokens, originalUri?: string): Promise<void> {
    let state = this.options.state;

    // Store tokens and update AuthState by the emitted events
    if (tokens) {
      this.tokenManager.setTokens(tokens);
      originalUri = originalUri || this.getOriginalUri(this.options.state);
    } else if (this.isLoginRedirect()) {
      // For redirect flow, get state from the URL and use it to retrieve the originalUri
      const oAuthResponse = await parseOAuthResponseFromUrl(this, {});
      state = oAuthResponse.state;
      originalUri = originalUri || this.getOriginalUri(state);
      await this.storeTokensFromRedirect();
    } else {
      return; // nothing to do
    }
    
    // ensure auth state has been updated
    await this.authStateManager.updateAuthState();

    // clear originalUri from storage
    this.removeOriginalUri(state);

    // Redirect to originalUri
    const { restoreOriginalUri } = this.options;
    if (restoreOriginalUri) {
      await restoreOriginalUri(this, originalUri);
    } else {
      window.location.replace(originalUri);
    }
  }

  isPKCE(): boolean {
    return !!this.options.pkce;
  }

  hasResponseType(responseType: string): boolean {
    let hasResponseType = false;
    if (Array.isArray(this.options.responseType) && this.options.responseType.length) {
      hasResponseType = this.options.responseType.indexOf(responseType) >= 0;
    } else {
      hasResponseType = this.options.responseType === responseType;
    }
    return hasResponseType;
  }

  isAuthorizationCodeFlow(): boolean {
    return this.hasResponseType('code');
  }

  // { username, password, (relayState), (context) }
  // signIn(opts: SignInWithCredentialsOptions): Promise<AuthTransaction> {
  //   return postToTransaction(this, '/api/v1/authn', opts);
  // }

  getIssuerOrigin(): string {
    // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
    return this.options.issuer.split('/oauth2/')[0];
  }

  // { username, (relayState) }
  forgotPassword(opts): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  }

  // { username, (relayState) }
  unlockAccount(opts: ForgotPasswordOptions): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  }

  // { recoveryToken }
  verifyRecoveryToken(opts: VerifyRecoveryTokenOptions): Promise<AuthTransaction> {
    return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  }
}

// Hoist feature detection functions to static type
OktaAuth.features = OktaAuth.prototype.features = features;

// Also hoist values and utility functions for CommonJS users
Object.assign(OktaAuth, {
  constants,
  isInteractionRequiredError
});

export default OktaAuth;