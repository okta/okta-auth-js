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
/* global window */

import { 
  DEFAULT_MAX_CLOCK_SKEW, 
  REFERRER_PATH_STORAGE_KEY
} from './constants';
import * as constants from './constants';
import {
  OktaAuthInterface,
  OktaAuthOptions, 
  AccessToken, 
  IDToken,
  RefreshToken,
  TokenAPI, 
  FeaturesAPI, 
  CryptoAPI,
  WebauthnAPI,
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
  FlowIdentifier,
  GetWithRedirectAPI,
  ParseFromUrlInterface,
  GetWithRedirectFunction,
  RequestOptions,
  IsAuthenticatedOptions,
} from './types';
import {
  transactionStatus,
  resumeTransaction,
  transactionExists,
  introspectAuthn,
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
import * as crypto from './crypto';
import * as webauthn from './crypto/webauthn';
import browserStorage from './browser/browserStorage';
import { 
  toQueryString, 
  toAbsoluteUrl,
  clone,
} from './util';
import { TokenManager } from './TokenManager';
import { ServiceManager } from './ServiceManager';
import { get, httpRequest, setRequestHeader } from './http';
import PromiseQueue from './PromiseQueue';
import fingerprint from './browser/fingerprint';
import { AuthStateManager } from './AuthStateManager';
import { StorageManager } from './StorageManager';
import TransactionManager from './TransactionManager';
import { buildOptions } from './options';
import {
  interact,
  introspect,
  authenticate,
  cancel,
  poll,
  proceed,
  register,
  recoverPassword,
  unlockAccount,
  startTransaction,
  handleInteractionCodeRedirect,
  canProceed,
  handleEmailVerifyCallback,
  isEmailVerifyCallback,
  parseEmailVerifyCallback,
  isEmailVerifyCallbackError
} from './idx';
import { OktaUserAgent } from './OktaUserAgent';
import { parseOAuthResponseFromUrl } from './oidc/parseFromUrl';
import {
  getSavedTransactionMeta,
  createTransactionMeta,
  getTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
  isTransactionMetaValid
} from './idx/transactionMeta';
// @ts-ignore 
// Do not use this type in code, so it won't be emitted in the declaration output
import Emitter from 'tiny-emitter';

class OktaAuth implements OktaAuthInterface, SigninAPI, SignoutAPI {
  options: OktaAuthOptions;
  storageManager: StorageManager;
  transactionManager: TransactionManager;
  tx: TransactionAPI;
  idx: IdxAPI;
  session: SessionAPI;
  pkce: PkceAPI;
  static features: FeaturesAPI;
  static crypto: CryptoAPI;
  static webauthn: WebauthnAPI;
  features!: FeaturesAPI;
  token: TokenAPI;
  _tokenQueue: PromiseQueue;
  emitter: any;
  tokenManager: TokenManager;
  authStateManager: AuthStateManager;
  serviceManager: ServiceManager;
  http: HttpAPI;
  fingerprint: FingerprintAPI;
  _oktaUserAgent: OktaUserAgent;
  _pending: { handleLogin: boolean };
  constructor(args: OktaAuthOptions) {
    const options = this.options = buildOptions(args);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.storageManager = new StorageManager(options.storageManager!, options.cookies!, options.storageUtil!);
    this.transactionManager = new TransactionManager(Object.assign({
      storageManager: this.storageManager,
    }, options.transactionManager));
    this._oktaUserAgent = new OktaUserAgent();

    this.tx = {
      status: transactionStatus.bind(null, this),
      resume: resumeTransaction.bind(null, this),
      exists: Object.assign(transactionExists.bind(null, this), {
        _get: (name) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const storage = options.storageUtil!.storage;
          return storage.get(name);
        }
      }),
      introspect: introspectAuthn.bind(null, this)
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
    const useQueue = (method) => {
      return PromiseQueue.prototype.push.bind(this._tokenQueue, method, null);
    };

    // eslint-disable-next-line max-len
    const getWithRedirectFn = useQueue(getWithRedirect.bind(null, this)) as GetWithRedirectFunction;
    const getWithRedirectApi: GetWithRedirectAPI = Object.assign(getWithRedirectFn, {
      // This is exposed so we can set window.location in our tests
      _setLocation: function(url) {
        window.location = url;
      }
    });
    // eslint-disable-next-line max-len
    const parseFromUrlFn = useQueue(parseFromUrl.bind(null, this)) as ParseFromUrlInterface;
    const parseFromUrlApi: ParseFromUrlInterface = Object.assign(parseFromUrlFn, {
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
    this.token = {
      prepareTokenParams: prepareTokenParams.bind(null, this),
      exchangeCodeForTokens: exchangeCodeForTokens.bind(null, this),
      getWithoutPrompt: getWithoutPrompt.bind(null, this),
      getWithPopup: getWithPopup.bind(null, this),
      getWithRedirect: getWithRedirectApi,
      parseFromUrl: parseFromUrlApi,
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
    const syncMethods = [
      // sync methods
      'decode',
      'isLoginRedirect',
      // already bound
      'getWithRedirect',
      'parseFromUrl'
    ];
    Object.keys(this.token).forEach(key => {
      if (syncMethods.indexOf(key) >= 0) { // sync methods should not be wrapped
        return;
      }
      var method = this.token[key];
      this.token[key] = PromiseQueue.prototype.push.bind(this._tokenQueue, method, null);
    });

    // IDX
    const boundStartTransaction = startTransaction.bind(null, this);
    this.idx = {
      interact: interact.bind(null, this),
      introspect: introspect.bind(null, this),
      authenticate: authenticate.bind(null, this),
      register: register.bind(null, this),
      start: boundStartTransaction,
      startTransaction: boundStartTransaction, // Use `start` instead. `startTransaction` will be removed in 7.0
      poll: poll.bind(null, this),
      proceed: proceed.bind(null, this),
      cancel: cancel.bind(null, this),
      recoverPassword: recoverPassword.bind(null, this),

      // oauth redirect callback
      handleInteractionCodeRedirect: handleInteractionCodeRedirect.bind(null, this),

      // interaction required callback
      isInteractionRequired: isInteractionRequired.bind(null, this),
      isInteractionRequiredError,

      // email verify callback
      handleEmailVerifyCallback: handleEmailVerifyCallback.bind(null, this),
      isEmailVerifyCallback,
      parseEmailVerifyCallback,
      isEmailVerifyCallbackError,
      
      getSavedTransactionMeta: getSavedTransactionMeta.bind(null, this),
      createTransactionMeta: createTransactionMeta.bind(null, this),
      getTransactionMeta: getTransactionMeta.bind(null, this),
      saveTransactionMeta: saveTransactionMeta.bind(null, this),
      clearTransactionMeta: clearTransactionMeta.bind(null, this),
      isTransactionMetaValid,
      setFlow: (flow: FlowIdentifier) => {
        this.options.flow = flow;
      },
      getFlow: (): FlowIdentifier | undefined => {
        return this.options.flow;
      },
      canProceed: canProceed.bind(null, this),
      unlockAccount: unlockAccount.bind(null, this),
    };

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

    // ServiceManager
    this.serviceManager = new ServiceManager(this, args.services);
  }

  start() {
    // TODO: review tokenManager.start
    this.tokenManager.start();
    if (!this.token.isLoginRedirect()) {
      this.authStateManager.updateAuthState();
    }
    this.serviceManager.start();
  }

  stop() {
    // TODO: review tokenManager.stop
    this.tokenManager.stop();
    this.serviceManager.stop();
  }

  setHeaders(headers) {
    this.options.headers = Object.assign({}, this.options.headers, headers);
  }


  // Authn  V1
  async signIn(opts: SigninOptions): Promise<AuthTransaction> {
    return this.signInWithCredentials(opts as SigninWithCredentialsOptions);
  }

  // Authn  V1
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
  closeSession(): Promise<unknown> {
    return this.session.close() // DELETE /api/v1/sessions/me
    .then(async () => {
      // Clear all local tokens
      this.tokenManager.clear();
    })
    .catch(function(e) {
      if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
        // Session does not exist or has already been closed
        return null;
      }
      throw e;
    });
  }
  
  // Revokes the access token for the application session
  async revokeAccessToken(accessToken?: AccessToken): Promise<unknown> {
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
  async revokeRefreshToken(refreshToken?: RefreshToken): Promise<unknown> {
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
      // local tokens are cleared once session is closed
      return this.closeSession() // can throw if the user cannot be signed out
      .then(function() {
        if (postLogoutRedirectUri === currentUri) {
          window.location.reload(); // force a hard reload if URI is not changing
        } else {
          window.location.assign(postLogoutRedirectUri);
        }
      });
    } else {
      if (options.clearTokensBeforeRedirect) {
        // Clear all local tokens
        this.tokenManager.clear();
      } else {
        this.tokenManager.addPendingRemoveFlags();
      }
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
  async isAuthenticated(options: IsAuthenticatedOptions = {}): Promise<boolean> {
    // TODO: remove dependency on tokenManager options in next major version - OKTA-473815
    const { autoRenew, autoRemove } = this.tokenManager.getOptions();

    const shouldRenew = options.onExpiredToken ? options.onExpiredToken === 'renew' : autoRenew;
    const shouldRemove = options.onExpiredToken ? options.onExpiredToken === 'remove' : autoRemove;

    let { accessToken } = this.tokenManager.getTokensSync();
    if (accessToken && this.tokenManager.hasExpired(accessToken)) {
      accessToken = undefined;
      if (shouldRenew) {
        try {
          accessToken = await this.tokenManager.renew('accessToken') as AccessToken;
        } catch {
          // Renew errors will emit an "error" event 
        }
      } else if (shouldRemove) {
        this.tokenManager.remove('accessToken');
      }
    }

    let { idToken } = this.tokenManager.getTokensSync();
    if (idToken && this.tokenManager.hasExpired(idToken)) {
      idToken = undefined;
      if (shouldRenew) {
        try {
          idToken = await this.tokenManager.renew('idToken') as IDToken;
        } catch {
          // Renew errors will emit an "error" event 
        }
      } else if (shouldRemove) {
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

  getOriginalUri(state?: string): string | undefined {
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
    return storage ? storage.getItem(REFERRER_PATH_STORAGE_KEY) || undefined : undefined;
  }

  removeOriginalUri(state?: string): void {
    // Remove from sessionStorage
    const storage = browserStorage.getSessionStorage();
    storage.removeItem(REFERRER_PATH_STORAGE_KEY);

    // Also remove from shared storage
    state = state || this.options.state;
    if (state) {
      const sharedStorage = this.storageManager.getOriginalUriStorage();
      sharedStorage.removeItem && sharedStorage.removeItem(state);
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
      try {
        // For redirect flow, get state from the URL and use it to retrieve the originalUri
        const oAuthResponse = await parseOAuthResponseFromUrl(this, {});
        state = oAuthResponse.state;
        originalUri = originalUri || this.getOriginalUri(state);
        await this.storeTokensFromRedirect();
      } catch(e) {
        // auth state should be updated
        await this.authStateManager.updateAuthState();
        throw e;
      }
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
    } else if (originalUri) {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.options.issuer!.split('/oauth2/')[0];
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

  // Escape hatch method to make arbitrary OKTA API call
  async invokeApiMethod(options: RequestOptions): Promise<unknown> {
    if (!options.accessToken) {
      const accessToken = (await this.tokenManager.getTokens()).accessToken as AccessToken;
      options.accessToken = accessToken?.accessToken;
    }
    return httpRequest(this, options);
  }
}

// Hoist feature detection functions to static type
OktaAuth.features = OktaAuth.prototype.features = features;

// Hoist crypto utils to static type
OktaAuth.crypto = crypto;

// Hoist webauthn utils to static type
OktaAuth.webauthn = webauthn;

// Also hoist constants for CommonJS users
Object.assign(OktaAuth, {
  constants
});

export default OktaAuth;