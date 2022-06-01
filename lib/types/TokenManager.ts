/* eslint-disable max-len */
import { AccessToken, IDToken, RefreshToken, Token, Tokens, TokenType } from './Token';

export interface TokenManagerError {
  errorSummary: string;
  errorCode: string;
  message: string;
  name: string;
  tokenKey: string;
}

export declare type TokenManagerErrorEventHandler = (error: TokenManagerError) => void;
export declare type TokenManagerEventHandler = (key: string, token: Token, oldtoken?: Token) => void;


export declare type AccessTokenCallback = (key: string, token: AccessToken) => void;
export declare type IDTokenCallback = (key: string, token: IDToken) => void;
export declare type RefreshTokenCallback = (key: string, token: RefreshToken) => void;

// only add methods needed internally
export interface TokenManagerInterface {
  on: (event: string, handler: TokenManagerErrorEventHandler | TokenManagerEventHandler, context?: object) => void;
  off: (event: string, handler?: TokenManagerErrorEventHandler | TokenManagerEventHandler) => void;
  getTokensSync(): Tokens;
  setTokens({ accessToken, idToken, refreshToken }: Tokens, accessTokenCb?: AccessTokenCallback, idTokenCb?: IDTokenCallback, refreshTokenCb?: RefreshTokenCallback): void;
  getStorageKeyByType(type: TokenType): string;
  add(key: any, token: Token): void;
  updateRefreshToken(token: RefreshToken);
  removeRefreshToken(): void;
}
