import { parseOAuthResponseFromUrl } from '../oidc/parseFromUrl';
import { getOAuthUrls } from '../oidc';
import { OktaAuthConstructor } from '../base/types';
import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  PKCETransactionMeta,
  Tokens,
  TransactionManagerInterface,
  CustomUserClaims,
  UserClaims,
  AccessToken,
  IDToken,
  RefreshToken,
  SignoutOptions,
  SignoutRedirectUrlOptions,
} from '../oidc/types';
import { TokenManager } from './TokenManager';
import { AuthStateManager } from './AuthStateManager';
import { ServiceManager } from './ServiceManager';
import { 
  OktaAuthCoreInterface, 
  OktaAuthCoreOptions, 
  IsAuthenticatedOptions 
} from './types';
import { httpRequest, RequestOptions } from '../http';

export function mixinCore
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthCoreInterface<M, S, O, TM>>
{
  return class OktaAuthCore extends Base implements OktaAuthCoreInterface<M, S, O, TM>
  {
    tokenManager: TokenManager;
    authStateManager: AuthStateManager<M, S, O>;
    serviceManager: ServiceManager<M, S, O>;
    
    constructor(...args: any[]) {
      super(...args);

      // TokenManager
      this.tokenManager = new TokenManager(this, {
        services: this.options.services,
        ...this.options.tokenManager,
      });

      // AuthStateManager
      this.authStateManager = this.tokenManager.authStateManager as AuthStateManager<M, S, O>;

      // ServiceManager
      this.serviceManager = this.tokenManager.serviceManager as ServiceManager<M, S, O>;
    }

    async start() {
      await this.serviceManager.start();
      // TODO: review tokenManager.start
      this.tokenManager.start();
      if (!this.token.isLoginRedirect()) {
        await this.authStateManager.updateAuthState();
      }
    }
  
    async stop() {
      // TODO: review tokenManager.stop
      this.tokenManager.stop();
      await this.serviceManager.stop();
    }

    // eslint-disable-next-line complexity
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
