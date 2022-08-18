import { StorageManagerInterface, StorageOptions, StorageProvider } from '../../storage/types';
import { OAuthTransactionMeta } from './meta';

export interface TransactionStorage<M extends OAuthTransactionMeta = OAuthTransactionMeta> extends StorageProvider {
  setStorage(obj: M): void;
  getStorage(): M;
}

export interface OAuthStorageManagerInterface<M extends OAuthTransactionMeta> extends StorageManagerInterface {
  getTransactionStorage(options?: StorageOptions): TransactionStorage<M>;
  getSharedTansactionStorage(options?: StorageOptions): TransactionStorage<M>;
  getOriginalUriStorage(options?: StorageOptions): TransactionStorage<M>;
  getTokenStorage(options?: StorageOptions): StorageProvider
}
