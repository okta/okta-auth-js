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

import { StorageProvider } from '../storage/types';
import {
  TransactionMeta,
  isTransactionMeta,
  TransactionMetaOptions,
  TransactionManagerOptions,
  OAuthTransactionMeta,
  OAuthStorageManagerInterface,
  ClearTransactionMetaOptions,
  TransactionManagerInterface,
  PKCETransactionMeta
} from './types';
import { warn } from '../util';
import {
  clearTransactionFromSharedStorage,
  loadTransactionFromSharedStorage,
  pruneSharedStorage,
  saveTransactionToSharedStorage
} from './util/sharedStorage';


export function createTransactionManager
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>
>
()
{
  return class TransactionManager implements TransactionManagerInterface
  {
    options: TransactionManagerOptions;
    storageManager: S;
    enableSharedStorage: boolean;
    saveLastResponse: boolean;

    constructor(options: TransactionManagerOptions) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.storageManager = options.storageManager! as S;
      this.enableSharedStorage = options.enableSharedStorage === false ? false : true;
      this.saveLastResponse = options.saveLastResponse === false ? false : true;
      this.options = options;
    }

    // eslint-disable-next-line complexity
    clear(options: ClearTransactionMetaOptions = {}) {
      const transactionStorage: StorageProvider = this.storageManager.getTransactionStorage();
      const meta = transactionStorage.getStorage();

      // Clear primary storage (by default, sessionStorage on browser)
      transactionStorage.clearStorage();

      // Usually we want to also clear shared storage unless another tab may need it to continue/complete a flow
      if (this.enableSharedStorage && options.clearSharedStorage !== false) {
        const state = options.state || meta?.state;
        if (state) {
          clearTransactionFromSharedStorage(this.storageManager, state);
        }
      }
    }

    // eslint-disable-next-line complexity
    save(meta: M, options: TransactionMetaOptions = {}) {
      // There must be only one transaction executing at a time.
      // Before saving, check to see if a transaction is already stored.
      // An existing transaction indicates a concurrency/race/overlap condition

      let storage: StorageProvider = this.storageManager.getTransactionStorage();
      const obj = storage.getStorage();
      // oie process may need to update transaction in the middle of process for tracking purpose
      // false alarm might be caused 
      // TODO: revisit for a better solution, https://oktainc.atlassian.net/browse/OKTA-430919
      if (isTransactionMeta(obj) && !options.muteWarning) {
        // eslint-disable-next-line max-len
        warn('a saved auth transaction exists in storage. This may indicate another auth flow is already in progress.');
      }

      storage.setStorage(meta);

      // Shared storage allows continuation of transaction in another tab
      if (this.enableSharedStorage && meta.state) {
        saveTransactionToSharedStorage(this.storageManager, meta.state, meta);
      }
    }

    exists(options: TransactionMetaOptions = {}): boolean {
      try {
        const meta = this.load(options);
        return !!meta;
      } catch {
        return false;
      }
    }

    // load transaction meta from storage
    // eslint-disable-next-line complexity,max-statements
    load(options: TransactionMetaOptions = {}): TransactionMeta | null {

      let meta: TransactionMeta;

      // If state was passed, try loading transaction data from shared storage
      if (this.enableSharedStorage && options.state) {
        pruneSharedStorage(this.storageManager); // prune before load
        meta = loadTransactionFromSharedStorage(this.storageManager, options.state);
        if (isTransactionMeta(meta)) {
          return meta;
        }
      }

      let storage: StorageProvider = this.storageManager.getTransactionStorage();
      meta = storage.getStorage();
      if (isTransactionMeta(meta)) {
        // if we have meta in the new location, there is no need to go further
        return meta;
      }

      return null;
    }

  };
}
