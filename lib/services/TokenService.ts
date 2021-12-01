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


/* global window */
import { TokenManager, EVENT_EXPIRED } from '../TokenManager';
import { AuthSdkError } from '../errors';
import { isBrowser } from '../features';
import browserStorage from '../browser/browserStorage';
import { TokenManagerOptions, PostSignOutStorageMeta } from '../types';
import { POST_SIGNOUT_STORAGE_NAME } from '../constants';

function shouldThrottleRenew(renewTimeQueue) {
  let res = false;
  renewTimeQueue.push(Date.now());
  if (renewTimeQueue.length >= 10) {
    // get and remove first item from queue
    const firstTime = renewTimeQueue.shift();
    const lastTime = renewTimeQueue[renewTimeQueue.length - 1];
    res = lastTime - firstTime < 30 * 1000;
  }
  return res;
}

export class TokenService {
  private tokenManager: TokenManager;
  private options: TokenManagerOptions;
  private storageListener: (event: StorageEvent) => void;
  private onTokenExpiredHandler: (key: string) => void;
  private syncTimeout: unknown;

  constructor(tokenManager: TokenManager, options: TokenManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
  }

  start() {
    const renewTimeQueue = [];
    this.onTokenExpiredHandler = (key) => {
      if (this.options.autoRenew) {
        if (shouldThrottleRenew(renewTimeQueue)) {
          const error = new AuthSdkError('Too many token renew requests');
          this.tokenManager.emitError(error);
        } else {
          this.tokenManager.renew(key).catch(() => {}); // Renew errors will emit an "error" event 
        }
      } else if (this.options.autoRemove) {
        this.tokenManager.remove(key);
      }
    };
    this.tokenManager.on(EVENT_EXPIRED, this.onTokenExpiredHandler);

    this.tokenManager.setExpireEventTimeoutAll();

    if (this.options.syncStorage && isBrowser()) {
      // Sync authState cross multiple tabs when localStorage is used as the storageProvider
      // A StorageEvent is sent to a window when a storage area it has access to is changed 
      // within the context of another document.
      // https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent

      this.storageListener = ({ key, newValue, oldValue }: StorageEvent) => {
        const handleCrossTabsStorageChange = () => {
          this.tokenManager.resetExpireEventTimeoutAll();
          this.tokenManager.emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
        };

        // Skip if:
        // not from localStorage.clear (event.key is null)
        // event.key is not the storageKey
        // oldValue === newValue
        if (key && (key !== this.options.storageKey || newValue === oldValue)) {
          return;
        }

        // LocalStorage cross tabs update is not synced in IE, set a 1s timer by default to read latest value
        // https://stackoverflow.com/questions/24077117/localstorage-in-win8-1-ie11-does-not-synchronize
        this.syncTimeout = setTimeout(() => handleCrossTabsStorageChange(), this.options._storageEventDelay);
      };

      window.addEventListener('storage', this.storageListener);
    }

    this.handlePostSignOutTokens();
  }

  stop() {
    this.tokenManager.clearExpireEventTimeoutAll();
    this.tokenManager.off(EVENT_EXPIRED, this.onTokenExpiredHandler);
    if (this.options.syncStorage && isBrowser()) {
      window.removeEventListener('storage', this.storageListener);
      clearTimeout(this.syncTimeout as any);
    }
  }

  private handlePostSignOutTokens() {
    if (!isBrowser()) {
      return;
    }

    const sessionStorage = browserStorage.getSessionStorage();
    let postLogoutMeta: PostSignOutStorageMeta = {};
    try {
      postLogoutMeta = JSON.parse(sessionStorage.getItem(POST_SIGNOUT_STORAGE_NAME) || '');
      sessionStorage.removeItem(POST_SIGNOUT_STORAGE_NAME);
    } catch (e) {
      // no valid meta in storage, do nothing
    }
    const now = Date.now();
    // Only clear tokens when find postSignOut flag within 30s
    if (postLogoutMeta.clearTokens && now - postLogoutMeta.timestamp < 30 * 1000) {
      this.tokenManager.clear();
    }
  }
}