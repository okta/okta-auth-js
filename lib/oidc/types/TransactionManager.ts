import { OAuthTransactionMeta, TransactionMetaOptions } from './meta';
import { OAuthStorageManagerInterface } from './storage';
import { TransactionManagerOptions, TransactionMeta } from './Transaction';

export interface ClearTransactionMetaOptions extends TransactionMetaOptions {
  clearSharedStorage?: boolean; // true by default
  clearIdxResponse?: boolean; // true by default
}

export interface TransactionManagerInterface {
  clear(options?: ClearTransactionMetaOptions);
  save(meta: OAuthTransactionMeta, options?: TransactionMetaOptions);
  exists(options?: TransactionMetaOptions);
  load(options?: TransactionMetaOptions): TransactionMeta | null
}


export interface TransactionManagerConstructor
<
  M extends OAuthTransactionMeta,
  S extends OAuthStorageManagerInterface<M>,
  TM extends TransactionManagerInterface = TransactionManagerInterface
>
{
  new (options: TransactionManagerOptions<M, S>): TM;
}
