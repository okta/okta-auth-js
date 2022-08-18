import { REFERRER_PATH_STORAGE_KEY } from '../constants';
import { RequestOptions } from '../http/types';
import { httpRequest } from '../http';
import { OktaAuthConstructor } from '../base/types';
import { 
  PromiseQueue,
} from '../util';
import { CryptoAPI } from '../crypto/types';
import * as crypto from '../crypto';
import {
  AccessToken,
  CustomUserClaims,
  IDToken,
  IsAuthenticatedOptions,
  OAuthResponseType,
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PkceAPI,
  PKCETransactionMeta,
  RefreshToken,
  SigninWithRedirectOptions,
  SignoutOptions,
  SignoutRedirectUrlOptions,
  TokenAPI,
  TransactionManagerInterface,
  TransactionManagerConstructor,
  UserClaims,
} from './types';
import PKCE from './util/pkce';
import { createTokenAPI } from './factory';
import { TokenManager } from './TokenManager';
import { getOAuthUrls, isLoginRedirect } from './util';
import browserStorage from '../browser/browserStorage';
import { OktaAuthSessionInterface } from '../session/types';

export function mixinOAuth
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions<M, S> = OktaAuthOAuthOptions<M, S>,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<O, OktaAuthSessionInterface<S, O>>
    = OktaAuthConstructor<O, OktaAuthSessionInterface<S, O>>
>
(
  Base: TBase,
  TransactionManagerConstructor: TransactionManagerConstructor<M, S, TM>,
): TBase & OktaAuthConstructor<O, OktaAuthOAuthInterface<M, S, O, TM>>
{
  return class OktaAuthOAuth extends Base implements OktaAuthOAuthInterface<M, S, O, TM>
  {
    static crypto: CryptoAPI = crypto;
    token: TokenAPI;
    tokenManager: TokenManager;
    transactionManager: TM;
    pkce: PkceAPI;

    _pending: { handleLogin: boolean };
    _tokenQueue: PromiseQueue;
    
    constructor(...args: any[]) {
      super(...args);

      this.transactionManager = new TransactionManagerConstructor(Object.assign({
        storageManager: this.storageManager,
      }, this.options.transactionManager));
  
      this.pkce = {
        DEFAULT_CODE_CHALLENGE_METHOD: PKCE.DEFAULT_CODE_CHALLENGE_METHOD,
        generateVerifier: PKCE.generateVerifier,
        computeChallenge: PKCE.computeChallenge
      };
  
      this._pending = { handleLogin: false };

      this._tokenQueue = new PromiseQueue();

      this.token = createTokenAPI(this, this._tokenQueue);

      // TokenManager
      this.tokenManager = new TokenManager(this, this.options.tokenManager);
    }

    // inherited from subclass
    clearStorage(): void {
      super.clearStorage();
      
      // Clear all local tokens
      this.tokenManager.clear();
    }

    // Returns true if both accessToken and idToken are not expired
    // If `autoRenew` option is set, will attempt to renew expired tokens before returning.
    // eslint-disable-next-line complexity
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

    async getUser<T extends CustomUserClaims = CustomUserClaims>(): Promise<UserClaims<T>> {
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

  
    isPKCE(): boolean {
      return !!this.options.pkce;
    }
  
    hasResponseType(responseType: OAuthResponseType): boolean {
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

    // Escape hatch method to make arbitrary OKTA API call
    async invokeApiMethod(options: RequestOptions): Promise<unknown> {
      if (!options.accessToken) {
        const accessToken = (await this.tokenManager.getTokens()).accessToken as AccessToken;
        options.accessToken = accessToken?.accessToken;
      }
      return httpRequest(this, options);
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
    // eslint-disable-next-line complexity
    async signOut(options?: SignoutOptions): Promise<void> {
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

  };
}
