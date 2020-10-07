import { AccessToken, IDToken, Token } from './Token';

export interface AuthState {
  accessToken?: AccessToken;
  idToken?: IDToken;
  isAuthenticated?: boolean;
  isPending?: boolean;
  error?: Error;
}

export interface AuthStateLogOptions {
  event?: string;
  key?: string;
  token?: Token;
}
