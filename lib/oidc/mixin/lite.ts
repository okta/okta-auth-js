
import { OktaAuthConstructor } from '../../base/types';
import {
  OAuthResponseType,
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterfaceLite,
  OktaAuthOAuthOptions,
  PKCETransactionMeta,
  TokenAPI,
  TransactionManagerInterface,
  TransactionManagerConstructor,
} from '../types';
import { createTokenAPILite } from '../factory/apiLite';
import { isLoginRedirect } from '../util';

import { OktaAuthSessionInterface } from '../../session/types';
export function mixinOAuthLite
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
): TBase & OktaAuthConstructor<OktaAuthOAuthInterfaceLite<M, S, O, TM>>
{
  return class OktaAuthOAuth extends Base implements OktaAuthOAuthInterfaceLite<M, S, O, TM>
  {
    token: TokenAPI;
    transactionManager: TM;
    
    constructor(...args: any[]) {
      super(...args);

      this.transactionManager = new TransactionManagerConstructor(Object.assign({
        storageManager: this.storageManager,
      }, this.options.transactionManager));
  
      this.token = createTokenAPILite(this as any);
    }

  
    isLoginRedirect(): boolean {
      return isLoginRedirect(this as any);
    }

    isPKCE(): boolean {
      return !!this.options.pkce;
    }
  
    hasResponseType(responseType: OAuthResponseType): boolean {
      let hasResponseType = false;
      if (Array.isArray(this.options.responseType) && this.options.responseType.length) {
        hasResponseType = this.options.responseType.indexOf(responseType) >= 0;
      } else {
        hasResponseType = this.options.responseType === responseType;
      }
      return hasResponseType;
    }
  
    isAuthorizationCodeFlow(): boolean {
      return this.hasResponseType('code');
    }
    

  };

}
