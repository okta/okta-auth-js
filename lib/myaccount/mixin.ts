import { OktaAuthConstructor } from '../base/types';
import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  PKCETransactionMeta,
} from '../oidc/types';
import { OktaAuthCoreInterface, OktaAuthCoreOptions } from '../core/types';
import { OktaAuthMyAccountInterface } from './types';

import * as MyAccountMethods from './api';

export function mixinMyAccount
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions<M, S> = OktaAuthCoreOptions<M, S>,
  TBase extends OktaAuthConstructor<O, OktaAuthCoreInterface<M, S, O>>
    = OktaAuthConstructor<O, OktaAuthCoreInterface<M, S, O>>
>
(Base: TBase): TBase & OktaAuthConstructor<O, OktaAuthMyAccountInterface<M, S, O>>
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
