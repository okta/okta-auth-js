import { Token, Tokens } from './Token';

export interface TokenManagerError {
  errorSummary: string;
  errorCode: string;
  message: string;
  name: string;
  tokenKey: string;
}

export declare type TokenManagerErrorEventHandler = (error: TokenManagerError) => void;
export declare type TokenManagerEventHandler = (key: string, token: Token, oldtoken?: Token) => void;

// only add methods needed internally
export interface TokenManagerInterface {
  on: (event: string, handler: TokenManagerErrorEventHandler | TokenManagerEventHandler, context?: object) => void;
  off: (event: string, handler?: TokenManagerErrorEventHandler | TokenManagerEventHandler) => void;
  getTokensSync(): Tokens;
}
