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
import { TokenManager } from '../TokenManager';
import { isBrowser } from '../features';
import { ServiceManagerOptions, ServiceInterface } from '../types';


export class SyncStorageService implements ServiceInterface {
  private tokenManager: TokenManager;
  private options: ServiceManagerOptions;
  private syncTimeout: unknown;
  private started = false;

  constructor(tokenManager: TokenManager, options: ServiceManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
    this.storageListener = this.storageListener.bind(this);
  }

  // Sync authState cross multiple tabs when localStorage is used as the storageProvider
  // A StorageEvent is sent to a window when a storage area it has access to is changed 
  // within the context of another document.
  // https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
  private storageListener({ key, newValue, oldValue }: StorageEvent) {
    const opts = this.tokenManager.getOptions();

    const handleCrossTabsStorageChange = () => {
      this.tokenManager.resetExpireEventTimeoutAll();
      this.tokenManager.emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
    };

    // Skip if:
    // not from localStorage.clear (event.key is null)
    // event.key is not the storageKey
    // oldValue === newValue
    if (key && (key !== opts.storageKey || newValue === oldValue)) {
      return;
    }

    // LocalStorage cross tabs update is not synced in IE, set a 1s timer by default to read latest value
    // https://stackoverflow.com/questions/24077117/localstorage-in-win8-1-ie11-does-not-synchronize
    this.syncTimeout = setTimeout(() => handleCrossTabsStorageChange(), opts._storageEventDelay);
  }

  requiresLeadership() {
    return false;
  }

  isStarted() {
    return this.started;
  }

  canStart() {
    return !!this.options.syncStorage && isBrowser();
  }

  start() {
    if (this.canStart()) {
      this.stop();
      window.addEventListener('storage', this.storageListener);
      this.started = true;
    }
  }

  stop() {
    if (this.started) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      window.removeEventListener('storage', this.storageListener!);
      clearTimeout(this.syncTimeout as any);
      this.started = false;
    }
  }
} 