import { UserClaims, IDToken, AccessToken } from './types';
import { OktaAuth, TokenManager } from './browser';
import { ACCESS_TOKEN_STORAGE_KEY, ID_TOKEN_STORAGE_KEY } from './constants';
import { AuthState } from './types';

const REFERRER_PATH_STORAGE_KEY = 'referrerPath';

class AuthService {
  private sdk: OktaAuth;
  private pending: { handleLogin: boolean };

  constructor(sdk: OktaAuth) {
    this.sdk = sdk;
    this.pending = { handleLogin: false };
  }

  // Common APIs

  async getUser(): Promise<UserClaims> {
    return this.sdk.token.getUserInfo();
  }

  async getIdToken(): Promise<string> {
    try {
      const idToken = await this.sdk.tokenManager.get(ID_TOKEN_STORAGE_KEY) as IDToken;
      return idToken ? idToken.idToken : undefined;
    } catch (err) {
      return undefined;
    }
  }

  async getAccessToken(): Promise<string> {
    try {
      const accessToken = await this.sdk.tokenManager.get(ACCESS_TOKEN_STORAGE_KEY) as AccessToken;
      return accessToken ? accessToken.accessToken : undefined;
    } catch (err) {
      return undefined;
    }
  }

  async login(fromUri?: string, additionalParams?: object): Promise<void> {
    if(this.pending.handleLogin) { 
      // Don't trigger second round
      return;
    }

    this.setFromUri(fromUri);
    try {
      if (this.sdk.options.onAuthRequired) {
        return await this.sdk.options.onAuthRequired(this.sdk);
      }
      return await this.loginRedirect(additionalParams);
    } finally {
      this.pending.handleLogin = null;
    }
  }

  async logout(options?: any): Promise<void> {
    let redirectUri = null;
    options = options || {};
    if (typeof options === 'string') {
      redirectUri = options;
      // If a relative path was passed, convert to absolute URI
      if (redirectUri.charAt(0) === '/') {
        redirectUri = window.location.origin + redirectUri;
      }
      options = {
        postLogoutRedirectUri: redirectUri
      };
    }
    await this.sdk.signOut(options);
  }

  async loginRedirect(additionalParams?: object): Promise<void> {
    const { scopes, responseType } = this.sdk.options;
    const params = Object.assign({
      scopes: scopes || ['openid', 'email', 'profile'],
      responseType: responseType || ['id_token', 'token']
    }, additionalParams);

    return this.sdk.token.getWithRedirect(params);
  }

  async handleAuthentication(): Promise<void> {
    const { tokens } = await this.sdk.token.parseFromUrl();
    if (tokens.idToken) {
      this.sdk.tokenManager.add(ID_TOKEN_STORAGE_KEY, tokens.idToken);
    }
    if (tokens.accessToken) {
      this.sdk.tokenManager.add(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
    }
  }

  setFromUri(fromUri?: string): void {
    // Use current location if fromUri was not passed
    fromUri = fromUri || window.location.href;
    // If a relative path was passed, convert to absolute URI
    if (fromUri.charAt(0) === '/') {
      fromUri = window.location.origin + fromUri;
    }
    sessionStorage.setItem(REFERRER_PATH_STORAGE_KEY, fromUri);
  }

  getFromUri(relative: boolean = false): string {
    let fromUri = sessionStorage.getItem(REFERRER_PATH_STORAGE_KEY) || window.location.origin;
    sessionStorage.removeItem(REFERRER_PATH_STORAGE_KEY);
    if (!relative) {
      return fromUri;
    }

    const url = new URL(fromUri);
    fromUri = `${url.pathname}${url.search}${url.hash}`
    return fromUri;
  }

  getTokenManager(): TokenManager {
    return this.sdk.tokenManager;
  }

  // Angular specific APIs

  isAuthenticated(): Promise<boolean> {
    const authState = this.sdk.authStateManager.getAuthState();
    return Promise.resolve(authState.isAuthenticated);
  }

  // React specific APIs

  redirect(additionalParams?: object): Promise<void> {
    return this.loginRedirect(additionalParams);
  }

  getAuthState(): AuthState {
    return this.sdk.authStateManager.getAuthState();
  }

  async updateAuthState(): Promise<void> {
    const accessToken = await this.sdk.tokenManager.get(ACCESS_TOKEN_STORAGE_KEY) as AccessToken;
    const idToken = await this.sdk.tokenManager.get(ID_TOKEN_STORAGE_KEY) as IDToken;
    this.sdk.authStateManager.updateAuthState({ accessToken, idToken });
  }

  on(eventName: String, callback: Function): Function {
    this.sdk.emitter.on(eventName, callback);
    return () => this.sdk.emitter.off(eventName);
  }
}

export default AuthService;
