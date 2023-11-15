import { OktaAuthOptionsConstructor } from '../../base/types';
import { StorageManagerConstructor } from '../../storage/types';
import { IdxTransactionManagerInterface, OktaAuthBaseIdxInterface, OktaAuthIdxConstructor } from '../types/api';
import { IdxTransactionMeta } from '../types/meta';
import { IdxStorageManagerInterface } from '../types/storage';
import { OktaAuthIdxOptions } from '../types/options';
import { TransactionManagerConstructor, OktaAuthBaseOAuthInterface } from '../../oidc/types';
import { mixinBaseIdx } from '../mixinBase';
import { createOktaAuthBase } from '../../base/factory';
import { mixinStorage } from '../../storage/mixin';
import { mixinHttp } from '../../http/mixin';
import { mixinSession } from '../../session/mixin';
import { mixinBaseOAuth } from '../../oidc/mixin/base';

export function createOktaAuthBaseIdx<
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
  OktaAuthBaseIdxInterface<M, S, O, TM> & OktaAuthBaseOAuthInterface<M, S, O, TM>
>
{
  const Base = createOktaAuthBase(OptionsConstructor);
  const WithStorage = mixinStorage<S, O>(Base, StorageManagerConstructor);
  const WithHttp = mixinHttp<S, O>(WithStorage);
  const WithSession = mixinSession<S, O>(WithHttp);
  const WithOAuth = mixinBaseOAuth<M, S, O, TM>(WithSession, TransactionManagerConstructor);
  const WithIdx = mixinBaseIdx(WithOAuth);
  return WithIdx;
}
