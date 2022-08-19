import { StorageManagerConstructor } from '../storage/types';
import { OktaAuthConstructor, OktaAuthOptionsConstructor } from '../base/types';
import {
  OAuthStorageManagerInterface,
  PKCETransactionMeta,
  TransactionManagerConstructor,
  TransactionManagerInterface
} from '../oidc/types';
import { createOktaAuthCore } from '../core/factory';
import { OktaAuthCoreOptions } from '../core/types';
import { mixinMyAccount } from './mixin';
import { OktaAuthMyAccountInterface } from './types';

export function createOktaAuthMyAccount
<
  M extends PKCETransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface
>
(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManager: TransactionManagerConstructor<TM>
)
: OktaAuthConstructor<OktaAuthMyAccountInterface<M, S, O>>
{
  const Core = createOktaAuthCore<M, S, O>(StorageManagerConstructor, OptionsConstructor, TransactionManager);
  const WithMyAccount = mixinMyAccount<M, S, O>(Core);
  return WithMyAccount;
}
