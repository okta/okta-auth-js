import { AccessToken, IDToken, RefreshToken, Token } from './Token';

export interface AuthState {
  accessToken?: AccessToken;
  idToken?: IDToken;
  refreshToken?: RefreshToken;
  isAuthenticated?: boolean;
  error?: Error;
}

export interface AuthStateLogOptions {
  event?: string;
  key?: string;
  token?: Token;
}
