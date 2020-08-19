import { AccessToken, IDToken } from './Token';

export interface AuthState {
  accessToken?: AccessToken;
  idToken?: IDToken;
  isAuthenticated?: boolean;
  isPending?: boolean;
}
