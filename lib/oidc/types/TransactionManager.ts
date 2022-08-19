import { OAuthTransactionMeta, TransactionMetaOptions } from './meta';
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
  TM extends TransactionManagerInterface = TransactionManagerInterface
>
{
  new (options: TransactionManagerOptions): TM;
}
