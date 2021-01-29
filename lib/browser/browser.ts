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

import OktaAuthBase from '../OktaAuthBase';
import * as features from './features';
import fetchRequest from '../fetch/fetchRequest';
import browserStorage from './browserStorage';
import { 
  removeTrailingSlash, 
  toQueryString, 
  toAbsoluteUrl,
  clone, 
  warn,
  deprecate 
} from '../util';
import { getUserAgent } from '../builderUtil';
import { 
  DEFAULT_MAX_CLOCK_SKEW, 
  REFERRER_PATH_STORAGE_KEY
} from '../constants';
import {
  closeSession,
  sessionExists,
  getSession,
  refreshSession,
  setCookieAndRedirect
} from '../session';
import {
  getWithoutPrompt,
  getWithPopup,
  getWithRedirect,
  parseFromUrl,
  decodeToken,
  revokeToken,
  renewToken,
  renewTokens,
  getUserInfo,
  verifyToken,
  prepareTokenParams,
  exchangeCodeForTokens
} from '../token';
import { TokenManager } from '../TokenManager';
import {
  getOAuthUrls,
  isLoginRedirect
} from '../oauthUtil';
import http from '../http';
import PromiseQueue from '../PromiseQueue';
import { 
  OktaAuth, 
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
  SignInWithCredentialsOptions,
  Tokens
} from '../types';
import fingerprint from './fingerprint';
import { postToTransaction } from '../tx';
import { AuthStateManager } from '../AuthStateManager';

const Emitter = require('tiny-emitter');

function getCookieSettings(args: OktaAuthOptions = {}, isHTTPS: boolean) {
  // Secure cookies will be automatically used on a HTTPS connection
  // Non-secure cookies will be automatically used on a HTTP connection
  // secure option can override the automatic behavior
  var cookieSettings = args.cookies || {};
  if (typeof cookieSettings.secure === 'undefined') {
    cookieSettings.secure = isHTTPS;
  }
  if (typeof cookieSettings.sameSite === 'undefined') {
    cookieSettings.sameSite = cookieSettings.secure ? 'none' : 'lax';
  }

  // If secure=true, but the connection is not HTTPS, set secure=false.
  if (cookieSettings.secure && !isHTTPS) {
    // eslint-disable-next-line no-console
    warn(
      'The current page is not being served with the HTTPS protocol.\n' +
      'For security reasons, we strongly recommend using HTTPS.\n' +
      'If you cannot use HTTPS, set "cookies.secure" option to false.'
    );
    cookieSettings.secure = false;
  }

  // Chrome >= 80 will block cookies with SameSite=None unless they are also Secure
  // If sameSite=none, but the connection is not HTTPS, set sameSite=lax.
  if (cookieSettings.sameSite === 'none' && !cookieSettings.secure) {
    cookieSettings.sameSite = 'lax';
  }

  return cookieSettings;
}

class OktaAuthBrowser extends OktaAuthBase implements OktaAuth, SignoutAPI {
  static features: FeaturesAPI;
  features: FeaturesAPI;
  token: TokenAPI;
  _tokenQueue: PromiseQueue;
  emitter: typeof Emitter;
  tokenManager: TokenManager;
  authStateManager: AuthStateManager;
  fingerprint: FingerprintAPI;
  _pending: { handleLogin: boolean };

  constructor(args: OktaAuthOptions = {}) {
    super(Object.assign({
      httpRequestClient: fetchRequest,
      storageUtil: args.storageUtil || browserStorage,
      cookies: getCookieSettings(args, OktaAuthBrowser.features.isHTTPS()),
      storageManager: Object.assign({
        token: {
          storageTypes: [
            'localStorage',
            'sessionStorage',
            'cookie'
          ],
          useMultipleCookies: true
        },
        cache: {
          storageTypes: [
            'localStorage',
            'sessionStorage',
            'cookie'
          ]
        },
        transaction: {
          storageTypes: [
            'sessionStorage',
            'localStorage',
            'cookie'
          ]
        }
      }, args.storageManager)
    }, args));

    // Add shims for compatibility, these will be removed in next major version. OKTA-362589
    Object.assign(this.options.storageUtil, {
      getPKCEStorage: this.storageManager.getLegacyPKCEStorage.bind(this.storageManager),
      getHttpCache: this.storageManager.getHttpCache.bind(this.storageManager),
    });

    this._pending = { handleLogin: false };
    this.options = Object.assign(this.options, {
      clientId: args.clientId,
      authorizeUrl: removeTrailingSlash(args.authorizeUrl),
      userinfoUrl: removeTrailingSlash(args.userinfoUrl),
      revokeUrl: removeTrailingSlash(args.revokeUrl),
      logoutUrl: removeTrailingSlash(args.logoutUrl),
      pkce: args.pkce === false ? false : true,
      redirectUri: toAbsoluteUrl(args.redirectUri, window.location.origin),
      postLogoutRedirectUri: args.postLogoutRedirectUri,
      responseMode: args.responseMode,
      responseType: args.responseType,
      transformErrorXHR: args.transformErrorXHR,
      scopes: args.scopes,
      transformAuthState: args.transformAuthState,
      restoreOriginalUri: args.restoreOriginalUri
    });
  
    this.userAgent = getUserAgent(args, `okta-auth-js/${SDK_VERSION}`);

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

    // Fingerprint API
    this.fingerprint = fingerprint.bind(null, this);
    

    this.emitter = new Emitter();
    this.tokenManager = new TokenManager(this, args.tokenManager);
    this.authStateManager = new AuthStateManager(this);
  }

  /**
   * Alias method of signInWithCredentials
   * 
   * @todo This method is deprecated. Remove it in 5.0
   */ 
  signIn(opts) {
    if (this.features.isLocalhost()) {
      deprecate('This method has been deprecated, please use signInWithCredentials() instead.');
    }
    return this.signInWithCredentials(opts);
  }

  signInWithCredentials(opts: SignInWithCredentialsOptions) {
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

  async signInWithRedirect({ originalUri, ...additionalParams }: SigninWithRedirectOptions = {}) {
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
  closeSession() {
    // Clear all local tokens
    this.tokenManager.clear();
  
    return this.session.close() // DELETE /api/v1/sessions/me
    .catch(function(e) {
      if (e.name === 'AuthApiError' && e.errorCode === 'E0000007') {
        // Session does not exist or has already been closed
        return;
      }
      throw e;
    });
  }
  
  // Revokes the access token for the application session
  async revokeAccessToken(accessToken?: AccessToken) {
    if (!accessToken) {
      accessToken = (await this.tokenManager.getTokens()).accessToken as AccessToken;
      const accessTokenKey = this.tokenManager._getStorageKeyByType('accessToken');
      this.tokenManager.remove(accessTokenKey);
    }
    // Access token may have been removed. In this case, we will silently succeed.
    if (!accessToken) {
      return Promise.resolve();
    }
    return this.token.revoke(accessToken);
  }

  // Revokes the refresh token for the application session
  async revokeRefreshToken(refreshToken?: RefreshToken) {
    if (!refreshToken) {
      refreshToken = (await this.tokenManager.getTokens()).refreshToken as RefreshToken;
      const refreshTokenKey = this.tokenManager._getStorageKeyByType('refreshToken');
      this.tokenManager.remove(refreshTokenKey);
    }
    // Refresh token may have been removed. In this case, we will silently succeed.
    if (!refreshToken) {
      return Promise.resolve();
    }
    return this.token.revoke(refreshToken);
  }

  // Revokes refreshToken or accessToken, clears all local tokens, then redirects to Okta to end the SSO session.
  async signOut(options?) {
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
    var idToken = options.idToken;
  
    var logoutUrl = getOAuthUrls(this).logoutUrl;
  
    if (typeof idToken === 'undefined') {
      idToken = (await this.tokenManager.getTokens()).idToken as IDToken;
    }
  
 
    if (revokeAccessToken && typeof refreshToken === 'undefined') {
      refreshToken = (await this.tokenManager.getTokens()).refreshToken as RefreshToken;
    }

    if (revokeAccessToken && typeof accessToken === 'undefined') {
      accessToken = (await this.tokenManager.getTokens()).accessToken as AccessToken;
    }
  
    // Clear all local tokens
    this.tokenManager.clear();

    if (revokeAccessToken && refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    if (revokeAccessToken && accessToken) {
      await this.revokeAccessToken(accessToken);
    }

    // No idToken? This can happen if the storage was cleared.
    // Fallback to XHR signOut, then simulate a redirect to the post logout uri
    if (!idToken) {
      return this.closeSession() // can throw if the user cannot be signed out
      .then(function() {
        if (postLogoutRedirectUri === currentUri) {
          window.location.reload(); // force a hard reload if URI is not changing
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
  }

  webfinger(opts) {
    var url = '/.well-known/webfinger' + toQueryString(opts);
    var options = {
      headers: {
        'Accept': 'application/jrd+json'
      }
    };
    return http.get(this, url, options);
  }

  //
  // Common Methods from downstream SDKs
  //

  async isAuthenticated(timeout?: number): Promise<boolean> {
    const authState = this.authStateManager.getAuthState();
    if (!authState.isPending) {
      return Promise.resolve(authState.isAuthenticated);
    }

    let clear, handler, timeoutId;
    return new Promise(resolve => {
      clear = () => {
        this.authStateManager.unsubscribe(handler);
        clearTimeout(timeoutId);
      };
      handler = ({isAuthenticated, isPending}) => {
        if (!isPending) {
          resolve(isAuthenticated);
          clear();
        }
      };
      timeoutId = setTimeout(() => {
        resolve(false);
        clear();
      }, timeout || 60 * 1000);
      this.authStateManager.subscribe(handler);
      this.authStateManager.updateAuthState();
    });
  }

  async getUser(): Promise<UserClaims> {
    const { idToken, accessToken } = this.authStateManager.getAuthState();
    return this.token.getUserInfo(accessToken, idToken);
  }

  getIdToken(): string | undefined {
    const { idToken } = this.authStateManager.getAuthState();
    return idToken ? idToken.idToken : undefined;
  }

  getAccessToken(): string | undefined {
    const { accessToken } = this.authStateManager.getAuthState();
    return accessToken ? accessToken.accessToken : undefined;
  }

  getRefreshToken(): string | undefined {
    const { refreshToken } = this.authStateManager.getAuthState();
    return refreshToken ? refreshToken.refreshToken : undefined;
  }

  /**
   * Store parsed tokens from redirect url
   */
  async storeTokensFromRedirect(): Promise<void> {
    const { tokens } = await this.token.parseFromUrl();
    this.tokenManager.setTokens(tokens);
  }

  setOriginalUri(originalUri?: string): void {
    // Use current location if originalUri was not passed
    originalUri = originalUri || window.location.href;
    // Store originalUri
    const storage = browserStorage.getSessionStorage();
    storage.setItem(REFERRER_PATH_STORAGE_KEY, originalUri);
  }

  getOriginalUri(): string {
    const storage = browserStorage.getSessionStorage();
    const originalUri = storage.getItem(REFERRER_PATH_STORAGE_KEY) || window.location.origin;
    return originalUri;
  }

  removeOriginalUri(): void {
    const storage = browserStorage.getSessionStorage();
    storage.removeItem(REFERRER_PATH_STORAGE_KEY);
  }

  isLoginRedirect(): boolean {
    return isLoginRedirect(this);
  }

  async handleLoginRedirect(tokens?: Tokens): Promise<void> {
    const handleRedirect = async ({ isPending }) => {
      if (isPending) {
        return;
      }

      // Unsubscribe listener
      this.authStateManager.unsubscribe(handleRedirect);

      // Get and clear originalUri from storage
      const originalUri = this.getOriginalUri();
      this.removeOriginalUri();

      // Redirect to originalUri
      const { restoreOriginalUri } = this.options;
      if (restoreOriginalUri) {
        await restoreOriginalUri(this, originalUri);
      } else {
        window.location.replace(originalUri);
      }
    };

    // Handle redirect after authState is updated 
    this.authStateManager.subscribe(handleRedirect);

    // Store tokens and update AuthState by the emitted events
    if (tokens) {
      this.tokenManager.setTokens(tokens);
    } else if (this.isLoginRedirect()) {
      await this.storeTokensFromRedirect();
    } else {
      this.authStateManager.unsubscribe(handleRedirect);
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
}

// Hoist feature detection functions to static type
OktaAuthBrowser.features = OktaAuthBrowser.prototype.features = features;

export default OktaAuthBrowser;
