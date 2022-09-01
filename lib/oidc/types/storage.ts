import {
  StorageManagerConstructor,
  StorageManagerInterface,
  StorageOptions,
  StorageProvider
} from '../../storage/types';
import { OAuthTransactionMeta, PKCETransactionMeta } from './meta';

export interface TransactionStorage<M extends OAuthTransactionMeta = OAuthTransactionMeta> extends StorageProvider {
  setStorage(obj: M): void;
  getStorage(): M;
}

export interface OAuthStorageManagerInterface
<
  M extends OAuthTransactionMeta = PKCETransactionMeta
>
extends StorageManagerInterface
{
  getTransactionStorage(options?: StorageOptions): TransactionStorage<M>;
  getSharedTansactionStorage(options?: StorageOptions): TransactionStorage<M>;
  getOriginalUriStorage(options?: StorageOptions): TransactionStorage<M>;
  getTokenStorage(options?: StorageOptions): StorageProvider
}

export type OAuthStorageManagerConstructor<M extends OAuthTransactionMeta = PKCETransactionMeta>
  = StorageManagerConstructor<OAuthStorageManagerInterface<M>>;
