/// <reference path="./tokens.d.ts" />
/// <reference path="./storage.d.ts" />

declare namespace OktaAuth {
  interface OAuthParams {
    pkce?: boolean;
    clientId?: string;
    redirectUri?: string;
    responseType?: string | string[];
    responseMode?: string;
    state?: string;
    nonce?: string;
    scopes?: string[];
    ignoreSignature?: boolean;
    codeChallengeMethod?: string;
    codeVerifier?: string;
    authorizationCode?: string;
  }

  interface CustomUserAgent {
    template?: string;
    value?: string;
  }

  interface SigninOptions {
    sendFingerprint?: boolean;
    username?: string;
    password?: string;
  }

  interface SignoutOptions {
    postLogoutRedirectUri?: string;
    accessToken?: AccessToken;
    revokeAccessToken?: boolean;
    idToken?: IDToken;
    state?: string;
  }

  interface CustomUrls {
    issuer?: string;
    authorizeUrl?: string;
    userinfoUrl?: string;
    tokenUrl?: string;
    revokeUrl?: string;
    logoutUrl?: string;
  }

  interface CookieOptions {
    secure?: boolean;
    sameSite?: string | boolean;
  }

  interface TokenManagerOptions {
    autoRenew?: boolean;
    secure?: boolean;
    storage?: string;
    storageKey?: string;
    expireEarlySeconds?: number;
  }

  type OnSessionExpiredFunction = () => void;

  interface OktaAuthOptions extends CustomUrls {
    pkce?: boolean;
    clientId?: string;
    redirectUri?: string;
    responseType?: string | string[];
    responseMode?: string;
    scopes?: string[];
    ignoreSignature?: boolean;
    tokenManager?: TokenManagerOptions;
    postLogoutRedirectUri?: string;
    onSessionExpired?: OnSessionExpiredFunction;
    storageUtil?: StorageUtil;
    ajaxRequest?: object;
    httpRequestClient?: object;
    userAgent?: CustomUserAgent;
    cookies?: CookieOptions;
    transformErrorXHR?: (xhr: object) => any;
    headers?: object;
    maxClockSkew?: number;
  }
}
