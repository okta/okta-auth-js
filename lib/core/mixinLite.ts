import type { OktaAuthConstructor } from '../base/types';
import type {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterfaceLite,
  PKCETransactionMeta,
  TransactionManagerInterface,
} from '../oidc/types';
import { OktaAuthCoreInterfaceLite, OktaAuthCoreOptions } from './types';

export function mixinCoreLite
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterfaceLite<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthOAuthInterfaceLite<M, S, O, TM>>
>
(Base: TBase): TBase & OktaAuthConstructor<OktaAuthCoreInterfaceLite<M, S, O, TM>>
{
  return class OktaAuthCore extends Base implements OktaAuthCoreInterfaceLite<M, S, O, TM>
  {
  };
}
