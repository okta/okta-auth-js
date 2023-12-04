import { OktaAuthOptionsConstructor } from '../../base/types';
import { StorageManagerConstructor } from '../../storage/types';
import { IdxTransactionManagerInterface, MinimalOktaAuthIdxInterface, OktaAuthIdxConstructor } from '../types/api';
import { IdxTransactionMeta } from '../types/meta';
import { IdxStorageManagerInterface } from '../types/storage';
import { OktaAuthIdxOptions } from '../types/options';
import { TransactionManagerConstructor, MinimalOktaOAuthInterface } from '../../oidc/types';
import { mixinMinimalIdx } from '../mixinMinimal';
import { createOktaAuthBase } from '../../base/factory';
import { mixinStorage } from '../../storage/mixin';
import { mixinHttp } from '../../http/mixin';
import { mixinSession } from '../../session/mixin';
import { mixinMinimalOAuth } from '../../oidc/mixin/minimal';

export function createMinimalOktaAuthIdx<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface
>(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>
)
: OktaAuthIdxConstructor<
  MinimalOktaAuthIdxInterface<M, S, O, TM> & MinimalOktaOAuthInterface<M, S, O, TM>
>
{
  const Base = createOktaAuthBase(OptionsConstructor);
  const WithStorage = mixinStorage<S, O>(Base, StorageManagerConstructor);
  const WithHttp = mixinHttp<S, O>(WithStorage);
  const WithSession = mixinSession<S, O>(WithHttp);
  const WithOAuth = mixinMinimalOAuth<M, S, O, TM>(WithSession, TransactionManagerConstructor);
  // do not mixin core
  const WithIdx = mixinMinimalIdx(WithOAuth);
  return WithIdx;
}
