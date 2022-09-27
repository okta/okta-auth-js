import {
  OAuthStorageManagerInterface,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PKCETransactionMeta,
  Tokens,
  TransactionManagerInterface,
  CustomUserClaims,
  UserClaims,
  AccessToken,
  RefreshToken,
  SignoutOptions,
} from '../../oidc/types';

import { ServiceManagerInterface, ServiceManagerOptions } from './Service';
import { AuthState, AuthStateManagerInterface } from './AuthState';
import { 
  TokenManagerInterface, 
  TokenManagerOptions, 
  IsAuthenticatedOptions,
} from '../types';

// options passed to AuthJS constructor
export interface OktaAuthCoreOptions extends OktaAuthOAuthOptions
{
  tokenManager?: TokenManagerOptions;
  services?: ServiceManagerOptions;
  // eslint-disable-next-line no-use-before-define
  transformAuthState?: (oktaAuth: OktaAuthCoreInterface, authState: AuthState) => Promise<AuthState>;
}

export type CoreStorageManagerInterface<
  M extends PKCETransactionMeta = PKCETransactionMeta
> = OAuthStorageManagerInterface<M>;

// an instance of AuthJS with OAuth and Services
export interface OktaAuthCoreInterface<
  M extends PKCETransactionMeta = PKCETransactionMeta,
  S extends CoreStorageManagerInterface<M> = CoreStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface
> 
extends OktaAuthOAuthInterface<M, S, O, TM>
{
  tokenManager: TokenManagerInterface;
  serviceManager: ServiceManagerInterface;
  authStateManager: AuthStateManagerInterface;
  start(): Promise<void>;
  stop(): Promise<void>;

  getIdToken(): string | undefined;
  getAccessToken(): string | undefined;
  getRefreshToken(): string | undefined;
  
  handleLoginRedirect(tokens?: Tokens, originalUri?: string): Promise<void>;
  isAuthenticated(options?: IsAuthenticatedOptions): Promise<boolean>;
  getUser<T extends CustomUserClaims = CustomUserClaims>(): Promise<UserClaims<T>>;
  storeTokensFromRedirect(): Promise<void>;
  signOut(opts?: SignoutOptions): Promise<void>;

  revokeAccessToken(accessToken?: AccessToken): Promise<unknown>;
  revokeRefreshToken(refreshToken?: RefreshToken): Promise<unknown>;
}
