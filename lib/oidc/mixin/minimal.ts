
import { OktaAuthConstructor } from '../../base/types';
import {
  OAuthResponseType,
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  MinimalOktaOAuthInterface,
  OktaAuthOAuthOptions,
  PKCETransactionMeta,
  BaseTokenAPI,
  TransactionManagerInterface,
  TransactionManagerConstructor,
} from '../types';
import { createBaseTokenAPI } from '../factory/baseApi';
import { isLoginRedirect, hasResponseType } from '../util';

import { OktaAuthSessionInterface } from '../../session/types';
export function mixinMinimalOAuth
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
    = OktaAuthConstructor<OktaAuthSessionInterface<S, O>>
>
(
  Base: TBase,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>,
): TBase & OktaAuthConstructor<MinimalOktaOAuthInterface<M, S, O, TM>>
{
  return class OktaAuthOAuth extends Base implements MinimalOktaOAuthInterface<M, S, O, TM>
  {
    token: BaseTokenAPI;
    transactionManager: TM;
    
    constructor(...args: any[]) {
      super(...args);

      this.transactionManager = new TransactionManagerConstructor(Object.assign({
        storageManager: this.storageManager,
      }, this.options.transactionManager));
  
      this.token = createBaseTokenAPI(this as any);
    }

    isLoginRedirect(): boolean {
      return isLoginRedirect(this as any);
    }

    isPKCE(): boolean {
      return !!this.options.pkce;
    }

    hasResponseType(responseType: OAuthResponseType): boolean {
      return hasResponseType(responseType, this.options);
    }

    isAuthorizationCodeFlow(): boolean {
      return this.hasResponseType('code');
    }

  };

}
