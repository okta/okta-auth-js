import { CookieOptions, StorageManagerOptions, StorageOptions, StorageUtil } from '../storage/types';
import {  IdxTransactionMeta } from './types';
import { SavedObject } from '../storage';
import { IDX_RESPONSE_STORAGE_NAME } from '../constants';
import { createCoreStorageManager } from '../core/storage';
import { IdxResponseStorage } from './types/storage';
import { isBrowser } from '../features';
import { warn } from '../util';
import AuthSdkError from '../errors/AuthSdkError';

export function createIdxStorageManager<M extends IdxTransactionMeta>()
{
  const CoreStorageManager = createCoreStorageManager<M>();
  return class IdxStorageManager extends CoreStorageManager
  {
    constructor(storageManagerOptions: StorageManagerOptions, cookieOptions: CookieOptions, storageUtil: StorageUtil) {
      super(storageManagerOptions, cookieOptions, storageUtil);
    }

    // intermediate idxResponse
    // store for network traffic optimazation purpose
    // TODO: revisit in auth-js 6.0 epic JIRA: OKTA-399791
    getIdxResponseStorage(options?: StorageOptions): IdxResponseStorage | null {
      let storage;
      if (isBrowser()) {
        // on browser side only use memory storage 
        try {
          storage = this.storageUtil.getStorageByType('memory', options);
        } catch (e) {
          // it's ok to miss response storage
          // eslint-disable-next-line max-len
          warn('No response storage found, you may want to provide custom implementation for intermediate idx responses to optimize the network traffic');
        }
      } else {
        // on server side re-use transaction custom storage
        const transactionStorage = this.getTransactionStorage(options);
        if (transactionStorage) {
          storage = {
            getItem: (key) => {
              const transaction = transactionStorage.getStorage();
              if (transaction && transaction[key]) {
                return transaction[key];
              }
              return null;
            },
            setItem: (key, val) => {
              const transaction = transactionStorage.getStorage();
              if (!transaction) {
                throw new AuthSdkError('Transaction has been cleared, failed to save idxState');
              }
              transaction[key] = val;
              transactionStorage.setStorage(transaction);
            },
            removeItem: (key) => {
              const transaction = transactionStorage.getStorage();
              if (!transaction) {
                return;
              }
              delete transaction[key];
              transactionStorage.setStorage(transaction);
            }
          };
        }
      }

      if (!storage) {
        return null;
      }

      return new SavedObject(storage, IDX_RESPONSE_STORAGE_NAME);
    }
  };
}
