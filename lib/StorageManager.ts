/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */



import {
  PKCE_STORAGE_NAME,
  TOKEN_STORAGE_NAME,
  TRANSACTION_STORAGE_NAME,
  SHARED_TRANSACTION_STORAGE_NAME,
  ORIGINAL_URI_STORAGE_NAME,
  IDX_RESPONSE_STORAGE_NAME,
  CACHE_STORAGE_NAME,
  REDIRECT_OAUTH_PARAMS_NAME
} from './constants';
import {
  StorageUtil,
  StorageProvider,
  StorageOptions,
  PKCEStorage,
  CookieOptions,
  TransactionStorage,
  IdxResponseStorage,
  StorageManagerOptions,
  SimpleStorage
} from './types';
import SavedObject from './SavedObject';
import { isBrowser } from './features';
import { warn } from './util';
import { AuthSdkError } from './errors';

function logServerSideMemoryStorageWarning(options: StorageOptions) {
  if (!isBrowser() && !options.storageProvider && !options.storageProvider) {
    // eslint-disable-next-line max-len
    warn('Memory storage can only support simple single user use case on server side, please provide custom storageProvider or storageKey if advanced scenarios need to be supported.');
  }
}

export class StorageManager {
  storageManagerOptions: StorageManagerOptions;
  cookieOptions: CookieOptions;
  storageUtil: StorageUtil;

  constructor(storageManagerOptions: StorageManagerOptions, cookieOptions: CookieOptions, storageUtil: StorageUtil) {
    this.storageManagerOptions = storageManagerOptions;
    this.cookieOptions = cookieOptions;
    this.storageUtil = storageUtil;
  }

  // combines defaults in order
  getOptionsForSection(sectionName: string, overrideOptions?: StorageOptions) {
    return Object.assign({}, this.storageManagerOptions[sectionName], overrideOptions);
  }
 
  // generic method to get any available storage provider
  // eslint-disable-next-line complexity
  getStorage(options: StorageOptions): SimpleStorage {
    options = Object.assign({}, this.cookieOptions, options); // set defaults

    if (options.storageProvider) {
      return options.storageProvider;
    }

    let { storageType, storageTypes } = options;

    if(storageType === 'sessionStorage') {
      options.sessionCookie = true;
    }

    // Maintain compatibility. Automatically fallback. May change in next major version. OKTA-362589
    if (storageType && storageTypes) {
      const idx = storageTypes.indexOf(storageType);
      if (idx >= 0) {
        storageTypes = storageTypes.slice(idx);
        storageType = undefined;
      }
    }

    if (!storageType) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      storageType = this.storageUtil.findStorageType(storageTypes!);
    }
    return this.storageUtil.getStorageByType(storageType, options);
  }

  // stateToken, interactionHandle
  getTransactionStorage(options?: StorageOptions): TransactionStorage {
    options = this.getOptionsForSection('transaction', options);
    logServerSideMemoryStorageWarning(options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TRANSACTION_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  getSharedTansactionStorage(options?: StorageOptions): TransactionStorage {
    options = this.getOptionsForSection('shared-transaction', options);
    logServerSideMemoryStorageWarning(options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || SHARED_TRANSACTION_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  getOriginalUriStorage(options?: StorageOptions): TransactionStorage {
    options = this.getOptionsForSection('original-uri', options);
    logServerSideMemoryStorageWarning(options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || ORIGINAL_URI_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
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

  // access_token, id_token, refresh_token
  getTokenStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('token', options);
    logServerSideMemoryStorageWarning(options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TOKEN_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // caches well-known response, among others
  getHttpCache(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('cache', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || CACHE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // Will be removed in an upcoming major version. OKTA-362589
  getLegacyPKCEStorage(options?: StorageOptions): PKCEStorage {
    options = this.getOptionsForSection('legacy-pkce', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || PKCE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  getLegacyOAuthParamsStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('legacy-oauth-params', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || REDIRECT_OAUTH_PARAMS_NAME;
    return new SavedObject(storage, storageKey);
  }
}
