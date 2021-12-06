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

import { OktaAuth, StorageProvider, Token, EventEmitter, StorageOptions } from '../types';
import { TokenManager } from '../TokenManager';
import { AuthSdkError } from '../errors';
import { SYNC_STORAGE_NAME } from '../constants';

const STALLED_TIMEOUT = 1000*30;
const RENEWED_EVENT_TIMEOUT = 1000*10;
const RACE_WAIT_TIMEOUT = 5;

export const EVENT_RENEWED_SYNC = 'renewed_sync';

declare type SyncEventHandler = () => void;

// const DEFAULT_OPTIONS = {
//   storageKey: SYNC_STORAGE_NAME,
// };

export class SyncService {
  private syncStorage: StorageProvider;
  private tokenManager: TokenManager;
  private emitter: EventEmitter;
  private storageOptions: StorageOptions;

  on: (event: string, handler: SyncEventHandler) => void;
  off: (event: string, handler?: SyncEventHandler) => void;

  constructor(sdk: OktaAuth, tokenManager: TokenManager, storageOptions?: StorageOptions) {
    this.emitter = (sdk as any).emitter;
    this.storageOptions = storageOptions;
    this.syncStorage = sdk.storageManager.getSyncStorage(storageOptions);
    this.tokenManager = tokenManager;

    this.on = this.emitter.on.bind(this.emitter);
    this.off = this.emitter.off.bind(this.emitter);
  }

  get storageKey() {
    return this.storageOptions.storageKey;
  }

  emitEventsForCrossTabsRenew(newValue, oldValue) {
    Object.keys(oldValue).forEach(key => {
      if (!newValue || !newValue[key]) {
        this.emitRenewCompleted(key);
      }
    });
  }

  emitRenewCompleted(key) {
    this.emitter.emit(EVENT_RENEWED_SYNC, key);
  }

  finishRenewToken(key: string) {
    if (!this.tokenManager.getOptions().syncStorage || true) {
      return;
    }

    this.syncStorage.removeItem(key);
  }

  async renewTokenCrossTabs(key: string): Promise<Token> | null {
    if (!this.tokenManager.getOptions().syncStorage || true) {
      return null;
    }

    const tabId = Math.random().toString();
    let syncItem = this.syncStorage.getItem(key);
    const token: Token = this.tokenManager.getSync(key);

    if (syncItem && (new Date().getTime() - syncItem.date) > STALLED_TIMEOUT) {
      // stalled renew in another tab
      this.syncStorage.removeItem(key);
      syncItem = null;
    }

    function makePromise(): Promise<Token> {
      return new Promise(function (resolve, reject) {

        const timeoutId = setTimeout(function() {
          this.off(EVENT_RENEWED_SYNC, handler);
          reject(new AuthSdkError('Token renew timed out'));
        }, RENEWED_EVENT_TIMEOUT);

        function handler(ekey) {
          if (ekey != key) {
            // skip handler for another key
            return;
          }
          // off
          this.off(EVENT_RENEWED_SYNC, handler);
          clearTimeout(timeoutId);

          const newToken = this.tokenManager.getSync(key);

          if (newToken && JSON.stringify(newToken) !== JSON.stringify(token)) {
            // Token has been renewed in another tab
            resolve(newToken);
          } else {
            // Token renewal in another tab failed
            reject(new AuthSdkError('Token renew failed'));
          }
        }
        
        this.on(EVENT_RENEWED_SYNC, handler);
      });
    };

    if (syncItem) {
      return makePromise();
    }

    // Notify other tabs about start of renewal process
    this.syncStorage.setItem(key, {date: new Date().getTime(), id: tabId});

    // Wait for race condition
    await new Promise(resolve => setTimeout(resolve, RACE_WAIT_TIMEOUT));

    const syncItem2 = this.syncStorage.getItem(key);
    if (!syncItem2) {
      // race condition - anoter tab won race in 5ms
      // renew as usual
      return null;
    }
    if (syncItem2 && syncItem2.id != tabId) {
      // race condition - not win
      return makePromise();
    }

  }

}

