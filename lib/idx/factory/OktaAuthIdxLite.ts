import { OktaAuthOptionsConstructor } from '../../base/types';
import { StorageManagerConstructor } from '../../storage/types';
import { IdxTransactionManagerInterface, OktaAuthIdxInterfaceLite, OktaAuthIdxConstructorLite } from '../types/api';
import { IdxTransactionMeta } from '../types/meta';
import { IdxStorageManagerInterface } from '../types/storage';
import { OktaAuthIdxOptions } from '../types/options';
import { TransactionManagerConstructor, OktaAuthOAuthInterfaceLite } from '../../oidc/types';
import { mixinIdxLite } from '../mixinLite';
import { createOktaAuthBase } from '../../base/factory';
import { mixinStorage } from '../../storage/mixin';
import { mixinHttp } from '../../http/mixin';
import { mixinSession } from '../../session/mixin';
import { mixinOAuthLite } from '../../oidc/mixin/lite';

export function createOktaAuthIdxLite<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface
>(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>
)
: OktaAuthIdxConstructorLite<
  OktaAuthIdxInterfaceLite<M, S, O, TM> &
  OktaAuthOAuthInterfaceLite<M, S, O, TM>
>
{
  const Base = createOktaAuthBase(OptionsConstructor);
  const WithStorage = mixinStorage<S, O>(Base, StorageManagerConstructor);
  const WithHttp = mixinHttp<S, O>(WithStorage);
  const WithSession = mixinSession<S, O>(WithHttp);
  const WithOAuth = mixinOAuthLite<M, S, O, TM>(WithSession, TransactionManagerConstructor);
  const WithIdx = mixinIdxLite(WithOAuth);
  return WithIdx;
}
