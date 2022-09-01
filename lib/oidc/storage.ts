import {
  CookieOptions,
  StorageManagerOptions,
  StorageOptions,
  StorageUtil
} from '../storage/types';
import { BaseStorageManager, logServerSideMemoryStorageWarning } from '../storage/BaseStorageManager';
import { TransactionStorage, OAuthTransactionMeta, OAuthStorageManagerInterface, PKCETransactionMeta } from './types';
import { SavedObject } from '../storage';
import { ORIGINAL_URI_STORAGE_NAME, SHARED_TRANSACTION_STORAGE_NAME, TRANSACTION_STORAGE_NAME } from '../constants';


export function createOAuthStorageManager<M extends OAuthTransactionMeta = PKCETransactionMeta>()
{
  return class OAuthStorageManager
    extends BaseStorageManager
    implements OAuthStorageManagerInterface<M>
  {
    constructor(storageManagerOptions: StorageManagerOptions, cookieOptions: CookieOptions, storageUtil: StorageUtil) {
      super(storageManagerOptions, cookieOptions, storageUtil);
    }

    getTransactionStorage(options?: StorageOptions): TransactionStorage<M> {
      options = this.getOptionsForSection('transaction', options);
      logServerSideMemoryStorageWarning(options);
      const storage = this.getStorage(options);
      const storageKey = options.storageKey || TRANSACTION_STORAGE_NAME;
      return new SavedObject(storage, storageKey);
    }

    getSharedTansactionStorage(options?: StorageOptions): TransactionStorage<M> {
      options = this.getOptionsForSection('shared-transaction', options);
      logServerSideMemoryStorageWarning(options);
      const storage = this.getStorage(options);
      const storageKey = options.storageKey || SHARED_TRANSACTION_STORAGE_NAME;
      return new SavedObject(storage, storageKey);
    }

    getOriginalUriStorage(options?: StorageOptions): TransactionStorage<M> {
      options = this.getOptionsForSection('original-uri', options);
      logServerSideMemoryStorageWarning(options);
      const storage = this.getStorage(options);
      const storageKey = options.storageKey || ORIGINAL_URI_STORAGE_NAME;
      return new SavedObject(storage, storageKey);
    }
  };

}
