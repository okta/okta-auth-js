/* global window */
import { TokenManager, EVENT_EXPIRED } from '../TokenManager';
import { AuthSdkError } from '../errors';
import { isBrowser } from '../features';
import { TokenManagerOptions } from '../types';

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
  }

  stop() {
    this.tokenManager.clearExpireEventTimeoutAll();
    this.tokenManager.off(EVENT_EXPIRED, this.onTokenExpiredHandler);
    if (this.options.syncStorage && isBrowser()) {
      window.removeEventListener('storage', this.storageListener);
      clearTimeout(this.syncTimeout as any);
    }
  }
}