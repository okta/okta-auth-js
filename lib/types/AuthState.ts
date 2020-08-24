import { AccessToken, IDToken } from './Token';

export interface AuthState {
  accessToken?: AccessToken;
  idToken?: IDToken;
  isAuthenticated?: boolean;
  isPending?: boolean;
  error?: Error;
}

export interface UpdateAuthStateOptions {
  accessToken: AccessToken;
  idToken: IDToken;
}
