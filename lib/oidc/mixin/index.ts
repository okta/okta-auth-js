import { httpRequest, RequestOptions } from '../../http';
import { OktaAuthConstructor } from '../../base/types';
import { 
  PromiseQueue,
  isFunction
} from '../../util';
import { CryptoAPI } from '../../crypto/types';
import * as crypto from '../../crypto';
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
  Endpoints,
  DPoPRequest,
  DPoPHeaders
} from '../types';
import PKCE from '../util/pkce';
import { createEndpoints, createTokenAPI } from '../factory/api';
import { TokenManager } from '../TokenManager';
import { getOAuthUrls, isLoginRedirect, hasResponseType } from '../util';
import { 
  generateDPoPProof,
  clearDPoPKeyPair,
  clearAllDPoPKeyPairs,
  clearDPoPKeyPairAfterRevoke,
  findKeyPair,
  isDPoPNonceError
} from '../dpop';
import { AuthSdkError, WWWAuthError } from '../../errors';

import { OktaAuthSessionInterface } from '../../session/types';
import { provideOriginalUri } from './node';
export function mixinOAuth
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
    = OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
>
(
  Base: TBase,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>,
): TBase & OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
{
  const WithOriginalUri = provideOriginalUri(Base);
  return class OktaAuthOAuth extends WithOriginalUri
  implements OktaAuthOAuthInterface<M, S, O, TM>
  {
    static crypto: CryptoAPI = crypto;
    token: TokenAPI;
    tokenManager: TokenManager;
    transactionManager: TM;
    pkce: PkceAPI;
    endpoints: Endpoints;

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

      this.endpoints = createEndpoints(this);
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

    async getOrRenewAccessToken(): Promise<string | null> {
      const { accessToken } = this.tokenManager.getTokensSync();
      if (accessToken && !this.tokenManager.hasExpired(accessToken)) {
        return accessToken.accessToken;
      }
      try {
        const key = this.tokenManager.getStorageKeyByType('accessToken');
        const token = await this.tokenManager.renew(key ?? 'accessToken');
        return (token as AccessToken)?.accessToken ?? null;
      }
      catch (err) {
        this.emitter.emit('error', err);
        return null;
      }
    }
  
    /**
     * Store parsed tokens from redirect url
     */
    async storeTokensFromRedirect(): Promise<void> {
      const { tokens, responseType } = await this.token.parseFromUrl();
      if (responseType !== 'none') {
        this.tokenManager.setTokens(tokens);
      }
    }
  
    isLoginRedirect(): boolean {
      return isLoginRedirect(this);
    }

    isPKCE(): boolean {
      return !!this.options.pkce;
    }

    hasResponseType(responseType: OAuthResponseType): boolean {
      return hasResponseType(responseType, this.options);
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
        const tokens = await this.tokenManager.getTokens();
        accessToken = tokens.accessToken;
        const accessTokenKey = this.tokenManager.getStorageKeyByType('accessToken');
        this.tokenManager.remove(accessTokenKey);

        if (this.options.dpop) {
          await clearDPoPKeyPairAfterRevoke('access', tokens);
        }
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
        const tokens = await this.tokenManager.getTokens();
        refreshToken = tokens.refreshToken;
        const refreshTokenKey = this.tokenManager.getStorageKeyByType('refreshToken');
        this.tokenManager.remove(refreshTokenKey);

        if (this.options.dpop) {
          await clearDPoPKeyPairAfterRevoke('refresh', tokens);
        }
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
      if (postLogoutRedirectUri === undefined) {
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
    // eslint-disable-next-line complexity, max-statements
    async signOut(options?: SignoutOptions): Promise<boolean> {
      options = Object.assign({}, options);
    
      // postLogoutRedirectUri must be whitelisted in Okta Admin UI
      const defaultUri = window.location.origin;
      const currentUri = window.location.href;
      // Fix for issue/1410 - allow for no postLogoutRedirectUri to be passed, resulting in /logout default behavior
      //    "If no Okta session exists, this endpoint has no effect and the browser is redirected immediately to the
      //    Okta sign-in page or the post_logout_redirect_uri (if specified)."
      // - https://developer.okta.com/docs/reference/api/oidc/#logout
      const postLogoutRedirectUri = options.postLogoutRedirectUri === null ? null :
        (options.postLogoutRedirectUri
        || this.options.postLogoutRedirectUri
        || defaultUri);
      const state = options?.state;
      
    
      let accessToken = options.accessToken;
      let refreshToken = options.refreshToken;
      const revokeAccessToken = options.revokeAccessToken !== false;
      const revokeRefreshToken = options.revokeRefreshToken !== false;
    
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

      const dpopPairId = accessToken?.dpopPairId ?? refreshToken?.dpopPairId;
      if (this.options.dpop && dpopPairId) {
        await clearDPoPKeyPair(dpopPairId);
      }

      const logoutUri = this.getSignOutRedirectUrl({ ...options, postLogoutRedirectUri });
      // No logoutUri? This can happen if the storage was cleared.
      // Fallback to XHR signOut, then simulate a redirect to the post logout uri
      if (!logoutUri) {
        // local tokens are cleared once session is closed
        const sessionClosed = await this.closeSession();   // can throw if the user cannot be signed out
        const redirectUri = new URL(postLogoutRedirectUri || defaultUri); // during fallback, redirectUri cannot be null
        if (state) {
          redirectUri.searchParams.append('state', state);
        }
        if (postLogoutRedirectUri === currentUri) {
          // window.location.reload(); // force a hard reload if URI is not changing
          window.location.href = redirectUri.href;
        } else {
          window.location.assign(redirectUri.href);
        }
        return sessionClosed;
      } else {
        if (options.clearTokensBeforeRedirect) {
          // Clear all local tokens
          this.tokenManager.clear();
        } else {
          this.tokenManager.addPendingRemoveFlags();
        }
        // Flow ends with logout redirect
        window.location.assign(logoutUri);
        return true;
      }
    }

    async getDPoPAuthorizationHeaders (params: DPoPRequest): Promise<DPoPHeaders> {
      if (!this.options.dpop) {
        throw new AuthSdkError('DPoP is not configured for this client instance');
      }

      let { accessToken } = params;
      if (!accessToken) {
        accessToken = (this.tokenManager.getTokensSync()).accessToken;
      }

      if (!accessToken) {
        throw new AuthSdkError('AccessToken is required to generate a DPoP Proof');
      }

      const keyPair = await findKeyPair(accessToken?.dpopPairId);
      const proof = await generateDPoPProof({...params, keyPair, accessToken: accessToken.accessToken});
      return {
        Authorization: `DPoP ${accessToken.accessToken}`,
        Dpop: proof
      };
    }

    async clearDPoPStorage (clearAll=false): Promise<void> {
      if (clearAll) {
        return clearAllDPoPKeyPairs();
      }

      const tokens = await this.tokenManager.getTokens();
      const keyPair = tokens.accessToken?.dpopPairId || tokens.refreshToken?.dpopPairId;

      if (keyPair) {
        await clearDPoPKeyPair(keyPair);
      }
    }

    parseUseDPoPNonceError (headers: HeadersInit): string | null {
      const wwwAuth = WWWAuthError.getWWWAuthenticateHeader(headers);
      const wwwErr = WWWAuthError.parseHeader(wwwAuth ?? '');
      if (isDPoPNonceError(wwwErr)) {
        let nonce: string | null = null;
        if (isFunction((headers as Headers)?.get)) {
          nonce = (headers as Headers).get('DPoP-Nonce');
        }
        nonce = nonce ?? headers['dpop-nonce'] ?? headers['DPoP-Nonce'];
        return nonce;
      }

      return null;
    }
  };

}
