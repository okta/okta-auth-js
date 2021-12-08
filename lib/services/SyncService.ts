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

const STALLED_TIMEOUT = 1000*30;
const RENEWED_EVENT_TIMEOUT = 1000*10;
const RACE_WAIT_TIMEOUT = 5;

export const EVENT_RENEWED_SYNC = 'renewed_sync';

declare type SyncEventHandler = (key: string) => void;


export class SyncService {
  private syncStorage: StorageProvider;
  private tokenManager: TokenManager;
  private emitter: EventEmitter;
  private storageOptions: StorageOptions;
  public tabId: string;

  on: (event: string, handler: SyncEventHandler) => void;
  off: (event: string, handler?: SyncEventHandler) => void;

  constructor(sdk: OktaAuth, tokenManager: TokenManager, storageOptions: StorageOptions) {
    this.emitter = (sdk as any).emitter;
    this.storageOptions = storageOptions;
    if (this.canUseCrossTabsStorage()) {
      try {
        this.syncStorage = sdk.storageManager.getSyncStorage(storageOptions);
      } catch(_e) {
        // Local storage is unavailable
      }
    }
    this.tokenManager = tokenManager;

    this.on = this.emitter.on.bind(this.emitter);
    this.off = this.emitter.off.bind(this.emitter);
    this.tabId = Math.random().toString();
  }

  get storageKey() {
    return this.storageOptions.storageKey;
  }

  canUseCrossTabsStorage() {
    // We need to listen to StorageEvent from window (which is not available on sever-side)
    return (typeof window !== 'undefined');
  }

  isSyncStorageEnabled() {
    return this.tokenManager.getOptions().syncStorage && this.syncStorage;
  }

  emitEventsForCrossTabsRenew(newValue, oldValue) {
    if (typeof newValue === 'string') {
      newValue = JSON.parse(newValue);
    }
    if (typeof oldValue === 'string') {
      oldValue = JSON.parse(oldValue);
    }
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
    if (!this.isSyncStorageEnabled()) {
      return;
    }

    // Free lock item
    this.syncStorage.removeItem(key);
  }

  renewTokenCrossTabs(key: string): Promise<Token | null> {
    if (!this.isSyncStorageEnabled()) {
      return Promise.resolve(null);
    }

    // Get current token to renew
    const token: Token = this.tokenManager.getSync(key);

    // Read lock item
    let syncItem = this.syncStorage.getItem(key);

    // Detect stalled token renewal
    if (syncItem && (new Date().getTime() - syncItem.date) > STALLED_TIMEOUT) {
      this.syncStorage.removeItem(key);
      syncItem = null;
    }

    // Create promise to wait for token renewal in another tab
    const makeWaitPromise = () => new Promise((resolve, reject) => {
      let timeoutId, handler;

      // Listen to EVENT_RENEWED_SYNC event
      handler = (ekey) => {
        if (ekey != key) {
          // Skip another keys
          return;
        }
        this.off(EVENT_RENEWED_SYNC, handler);
        clearTimeout(timeoutId);

        // Get fresh token that other tab had just renewed
        const newToken = this.tokenManager.getSync(key) as Token;

        if (newToken && JSON.stringify(newToken) !== JSON.stringify(token)) {
          // Token has been renewed in another tab
          resolve(newToken);
        } else {
          // Token renewal in another tab failed
          reject(new AuthSdkError('Token renew failed'));
        }
      };

      // Set timeout for EVENT_RENEWED_SYNC event
      timeoutId = setTimeout(() => {
        this.off(EVENT_RENEWED_SYNC, handler);
        reject(new AuthSdkError('Token renew timed out'));
      }, RENEWED_EVENT_TIMEOUT);
      
      this.on(EVENT_RENEWED_SYNC, handler);
    }) as Promise<Token>;

    // If lock is not free, token renewal has been already started in another tab => wait for it
    if (syncItem) {
      return makeWaitPromise();
    }

    // Try to acquire lock
    this.syncStorage.setItem(key, {date: new Date().getTime(), id: this.tabId});

    // Wait small period of time for potential race condition
    return new Promise(resolve => setTimeout(resolve, RACE_WAIT_TIMEOUT)).then(() => {
      // Read lock item again
      const syncItem2 = this.syncStorage.getItem(key);
      if (!syncItem2) {
        // Another tab had just renewed token in small time period
        // Can renew token as usual
        return null;
        // TODO: or get fresh token, compare and resolve???  add unit test with bigger RACE_WAIT_TIMEOUT
      } else if (syncItem2 && syncItem2.id != this.tabId) {
        // Lost race condition, lock was aquired by another tab => wait for it
        return makeWaitPromise();
      } else {
        // No race condition or won race condition => can continue
        return null;
      }
    });

  }

}

