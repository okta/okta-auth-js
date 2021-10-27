import { RefreshToken, Token, Tokens, TokenType } from './Token';
export interface TokenManagerError {
    errorSummary: string;
    errorCode: string;
    message: string;
    name: string;
    tokenKey: string;
}
export declare type TokenManagerErrorEventHandler = (error: TokenManagerError) => void;
export declare type TokenManagerEventHandler = (key: string, token: Token, oldtoken?: Token) => void;
export interface TokenManagerInterface {
    on: (event: string, handler: TokenManagerErrorEventHandler | TokenManagerEventHandler, context?: object) => void;
    off: (event: string, handler?: TokenManagerErrorEventHandler | TokenManagerEventHandler) => void;
    getTokensSync(): Tokens;
    setTokens({ accessToken, idToken, refreshToken }: Tokens, accessTokenCb?: Function, idTokenCb?: Function, refreshTokenCb?: Function): void;
    getStorageKeyByType(type: TokenType): string;
    add(key: any, token: Token): void;
    updateRefreshToken(token: RefreshToken): any;
}
