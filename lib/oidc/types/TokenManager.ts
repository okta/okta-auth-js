/* eslint-disable max-len */
import { StorageProvider } from '../../storage/types';
import { TokenManagerOptions } from './options';
import { AccessToken, IDToken, RefreshToken, Token, Tokens, TokenType } from './Token';

export interface TokenManagerError {
  errorSummary: string;
  errorCode: string;
  message: string;
  name: string;
  tokenKey: string;
}

export declare type AccessTokenCallback = (key: string, token: AccessToken) => void;
export declare type IDTokenCallback = (key: string, token: IDToken) => void;
export declare type RefreshTokenCallback = (key: string, token: RefreshToken) => void;

export const EVENT_EXPIRED = 'expired';
export const EVENT_RENEWED = 'renewed';
export const EVENT_ADDED = 'added';
export const EVENT_REMOVED = 'removed';
export const EVENT_ERROR = 'error';
export const EVENT_SET_STORAGE = 'set_storage';

export declare type TokenManagerErrorEventHandler = (error: TokenManagerError) => void;
export declare type TokenManagerEventHandler = (key: string, token: Token) => void;
export declare type TokenManagerRenewEventHandler = (key: string, token: Token, oldtoken: Token) => void;
export declare type TokenManagerSetStorageEventHandler = (storage: Tokens) => void;

export declare type TokenManagerAnyEventHandler = TokenManagerErrorEventHandler | TokenManagerRenewEventHandler | TokenManagerSetStorageEventHandler | TokenManagerEventHandler;
export declare type TokenManagerAnyEvent = typeof EVENT_RENEWED | typeof EVENT_ERROR | typeof EVENT_SET_STORAGE | typeof EVENT_EXPIRED | typeof EVENT_ADDED | typeof EVENT_REMOVED;

// only add methods needed internally
export interface TokenManagerInterface {
  on(event: typeof EVENT_RENEWED, handler: TokenManagerRenewEventHandler, context?: object): void;
  on(event: typeof EVENT_ERROR, handler: TokenManagerErrorEventHandler, context?: object): void;
  on(event: typeof EVENT_SET_STORAGE, handler: TokenManagerSetStorageEventHandler, context?: object): void;
  on(event: typeof EVENT_EXPIRED | typeof EVENT_ADDED | typeof EVENT_REMOVED, handler: TokenManagerEventHandler, context?: object): void;

  off(event: typeof EVENT_RENEWED, handler?: TokenManagerRenewEventHandler): void;
  off(event: typeof EVENT_ERROR, handler?: TokenManagerErrorEventHandler): void;
  off(event: typeof EVENT_SET_STORAGE, handler?: TokenManagerSetStorageEventHandler): void;
  off(event: typeof EVENT_EXPIRED | typeof EVENT_ADDED | typeof EVENT_REMOVED, handler?: TokenManagerEventHandler): void;

  clear(): void;
  setExpireEventTimeout(key: string, token: Token): void;
  clearExpireEventTimeout(key: string): void;
  clearExpireEventTimeoutAll(): void;
  emitAdded(key: string, token: Token): void;
  emitError(error: Error): void;
  emitRemoved(key: string, token: Token): void;
  emitRenewed(key: string, token: Token, oldToken?: Token): void;
  renew(key: string): Promise<Token | undefined>;
  remove(key: string): void;
  hasExpired(token: Token): boolean;
  getExpireTime(token: Token): number;

  get(key): Promise<Token | undefined>;
  getSync(key): Token | undefined;
  getTokens(): Promise<Tokens>;
  getTokensSync(): Tokens;
  setTokens({ accessToken, idToken, refreshToken }: Tokens, accessTokenCb?: AccessTokenCallback, idTokenCb?: IDTokenCallback, refreshTokenCb?: RefreshTokenCallback): void;
  getStorageKeyByType(type: TokenType): string;
  add(key: any, token: Token): void;
  updateRefreshToken(token: RefreshToken);
  removeRefreshToken(): void;
  clearPendingRemoveTokens(): void;

  getOptions(): TokenManagerOptions;
  getStorage(): StorageProvider;

  start();
  stop();
  isStarted(): boolean;
}
