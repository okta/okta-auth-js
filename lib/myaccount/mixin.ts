import { OktaAuthConstructor } from '../base/types';
import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PKCETransactionMeta,
} from '../oidc/types';
import { OktaAuthMyAccountInterface } from './types';

import * as MyAccountMethods from './api';

export function mixinMyAccount
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O>>
    = OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthMyAccountInterface<M, S, O>>
{
  return class OktaAuthMyAccount extends Base implements OktaAuthMyAccountInterface<M, S, O>
  {
    myaccount: any;
    
    constructor(...args: any[]) {
      super(...args);

      this.myaccount = Object.entries(MyAccountMethods)
        .filter(([ name ]) => name !== 'default')
        .reduce((acc, [name, fn]) => {
          acc[name] = (fn as any).bind(null, this);
          return acc;
        }, {});
    }
  };
}
