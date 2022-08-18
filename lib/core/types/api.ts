import {
  OAuthStorageManagerInterface,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PKCETransactionMeta,
  Tokens,
  TransactionManagerInterface
} from '../../oidc/types';

import { ServiceManagerInterface, ServiceManagerOptions } from './Service';
import { AuthState, AuthStateManagerInterface } from './AuthState';


// options passed to AuthJS constructor
export interface OktaAuthCoreOptions
<
  M extends PKCETransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>
>
extends OktaAuthOAuthOptions<M, S>
{
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
  O extends OktaAuthCoreOptions<M, S> = OktaAuthCoreOptions<M, S>,
  TM extends TransactionManagerInterface = TransactionManagerInterface
> 
extends OktaAuthOAuthInterface<M, S, O, TM>
{
  serviceManager: ServiceManagerInterface;
  authStateManager: AuthStateManagerInterface;
  handleLoginRedirect(tokens?: Tokens, originalUri?: string): Promise<void>;
}
