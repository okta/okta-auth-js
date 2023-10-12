import { createOktaAuthCoreLite } from '../../core/factoryLite';
import { OktaAuthOptionsConstructor } from '../../base/types';
import { StorageManagerConstructor } from '../../storage/types';
import { IdxTransactionManagerInterface, OktaAuthIdxInterfaceLite, OktaAuthIdxConstructorLite } from '../types/api';
import { IdxTransactionMeta } from '../types/meta';
import { IdxStorageManagerInterface } from '../types/storage';
import { OktaAuthIdxOptions } from '../types/options';
import { TransactionManagerConstructor } from '../../oidc/types';
import { mixinIdxLite } from '../mixinLite';
import { OktaAuthCoreInterfaceLite } from '../../core/types';

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
  OktaAuthCoreInterfaceLite<M, S, O, TM>
>
{
  const Core = createOktaAuthCoreLite<M, S, O, TM>(
    StorageManagerConstructor,
    OptionsConstructor,
    TransactionManagerConstructor
  );
  const WithIdx = mixinIdxLite(Core);
  return WithIdx;
}
