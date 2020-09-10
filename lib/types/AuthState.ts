import { AccessToken, IDToken, Token } from './Token';

export interface AuthState {
  accessToken?: AccessToken;
  idToken?: IDToken;
  isAuthenticated?: boolean;
  isPending?: boolean;
  error?: Error;
}

export interface UpdateAuthStateOptions {
  event?: string;
  key?: string;
  token?: Token;
}
