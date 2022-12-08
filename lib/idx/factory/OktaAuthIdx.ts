import { createOktaAuthCore } from '../../core/factory';
import { OktaAuthOptionsConstructor } from '../../base/types';
import { StorageManagerConstructor } from '../../storage/types';
import { IdxTransactionManagerInterface, OktaAuthIdxInterface, OktaAuthIdxConstructor } from '../types/api';
import { IdxTransactionMeta } from '../types/meta';
import { IdxStorageManagerInterface } from '../types/storage';
import { OktaAuthIdxOptions } from '../types/options';
import { mixinIdx } from '../mixin';
import { TransactionManagerConstructor } from '../../oidc/types';
import { OktaAuthCoreInterface } from '../../core/types';

export function createOktaAuthIdx<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface
>(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>
)
: OktaAuthIdxConstructor<OktaAuthIdxInterface<M, S, O, TM> & OktaAuthCoreInterface<M, S, O, TM>>
{
  const Core = createOktaAuthCore<M, S, O, TM>(
    StorageManagerConstructor,
    OptionsConstructor,
    TransactionManagerConstructor
  );
  const WithIdx = mixinIdx(Core);
  return WithIdx;
}
