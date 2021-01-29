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
 *
 */
/* global window */
/* eslint complexity:[0,8] max-statements:[0,21] */
import { removeNils, warn, isObject, clone, isIE11OrLess } from './util';
import AuthSdkError from './errors/AuthSdkError';
import { TOKEN_STORAGE_NAME } from './constants';
import SdkClock from './clock';
import { 
  Token, 
  Tokens, 
  TokenType, 
  TokenManagerOptions, 
  isIDToken, 
  isAccessToken,
  isRefreshToken,
  StorageOptions,
  StorageType,
  OktaAuth
} from './types';
import { ID_TOKEN_STORAGE_KEY, ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './constants';

const DEFAULT_OPTIONS = {
  autoRenew: true,
  autoRemove: true,
  storage: 'localStorage',
  expireEarlySeconds: 30,
  storageKey: TOKEN_STORAGE_NAME,
  _storageEventDelay: 0
};
export const EVENT_EXPIRED = 'expired';
export const EVENT_RENEWED = 'renewed';
export const EVENT_ADDED = 'added';
export const EVENT_REMOVED = 'removed';
export const EVENT_ERROR = 'error';

function getExpireTime(tokenMgmtRef, token) {
  var expireTime = token.expiresAt - tokenMgmtRef.options.expireEarlySeconds;
  return expireTime;
}

function hasExpired(tokenMgmtRef, token) {
  var expireTime = getExpireTime(tokenMgmtRef, token);
  return expireTime <= tokenMgmtRef.clock.now();
}

function emitExpired(tokenMgmtRef, key, token) {
  tokenMgmtRef.emitter.emit(EVENT_EXPIRED, key, token);
}

function emitRenewed(tokenMgmtRef, key, freshToken, oldToken) {
  tokenMgmtRef.emitter.emit(EVENT_RENEWED, key, freshToken, oldToken);
}

function emitAdded(tokenMgmtRef, key, token) {
  tokenMgmtRef.emitter.emit(EVENT_ADDED, key, token);
}

function emitRemoved(tokenMgmtRef, key, token?) {
  tokenMgmtRef.emitter.emit(EVENT_REMOVED, key, token);
}

function emitError(tokenMgmtRef, error) {
  tokenMgmtRef.emitter.emit(EVENT_ERROR, error);
}

function emitEventsForCrossTabsStorageUpdate(tokenMgmtRef, newValue, oldValue) {
  const oldTokens = getTokensFromStorageValue(oldValue);
  const newTokens = getTokensFromStorageValue(newValue);
  Object.keys(newTokens).forEach(key => {
    const oldToken = oldTokens[key];
    const newToken = newTokens[key];
    if (JSON.stringify(oldToken) !== JSON.stringify(newToken)) {
      emitAdded(tokenMgmtRef, key, newToken);
    }
  });
  Object.keys(oldTokens).forEach(key => {
    const oldToken = oldTokens[key];
    const newToken = newTokens[key];
    if (!newToken) {
      emitRemoved(tokenMgmtRef, key, oldToken);
    }
  });
}

function clearExpireEventTimeout(tokenMgmtRef, key) {
  clearTimeout(tokenMgmtRef.expireTimeouts[key]);
  delete tokenMgmtRef.expireTimeouts[key];

  // Remove the renew promise (if it exists)
  delete tokenMgmtRef.renewPromise[key];
}

function clearExpireEventTimeoutAll(tokenMgmtRef) {
  var expireTimeouts = tokenMgmtRef.expireTimeouts;
  for (var key in expireTimeouts) {
    if (!Object.prototype.hasOwnProperty.call(expireTimeouts, key)) {
      continue;
    }
    clearExpireEventTimeout(tokenMgmtRef, key);
  }
}

function setExpireEventTimeout(sdk, tokenMgmtRef, key, token) {
  var expireTime = getExpireTime(tokenMgmtRef, token);
  var expireEventWait = Math.max(expireTime - tokenMgmtRef.clock.now(), 0) * 1000;

  // Clear any existing timeout
  clearExpireEventTimeout(tokenMgmtRef, key);

  var expireEventTimeout = setTimeout(function() {
    emitExpired(tokenMgmtRef, key, token);
  }, expireEventWait);

  // Add a new timeout
  tokenMgmtRef.expireTimeouts[key] = expireEventTimeout;
}

function setExpireEventTimeoutAll(sdk, tokenMgmtRef, storage) {
  try {
    var tokenStorage = storage.getStorage();
  } catch(e) {
    // Any errors thrown on instantiation will not be caught,
    // because there are no listeners yet
    emitError(tokenMgmtRef, e);
    return;
  }

  for(var key in tokenStorage) {
    if (!Object.prototype.hasOwnProperty.call(tokenStorage, key)) {
      continue;
    }
    var token = tokenStorage[key];
    setExpireEventTimeout(sdk, tokenMgmtRef, key, token);
  }
}

// reset timeouts to setup autoRenew for tokens from other document context (tabs)
function resetExpireEventTimeoutAll(sdk, tokenMgmtRef, storage) {
  clearExpireEventTimeoutAll(tokenMgmtRef);
  setExpireEventTimeoutAll(sdk, tokenMgmtRef, storage);
}

function validateToken(token: Token) {
  if (!isObject(token) ||
      !token.scopes ||
      (!token.expiresAt && token.expiresAt !== 0) ||
      (!isIDToken(token) && !isAccessToken(token) && !isRefreshToken(token))) {
    throw new AuthSdkError(
      'Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property'
      );
  }
}

function add(sdk, tokenMgmtRef, storage, key, token: Token) {
  if (sdk.features.isLocalhost()) {
    warn(
      'Use setTokens() instead if you want to add a set of tokens at same time.\n' + 
      'It prevents current tab from emitting unnecessary StorageEvent,\n' + 
      'which may cause false-positive authState change cross tabs.'
    );
  }

  var tokenStorage = storage.getStorage();
  validateToken(token);
  tokenStorage[key] = token;
  storage.setStorage(tokenStorage);
  emitAdded(tokenMgmtRef, key, token);
  setExpireEventTimeout(sdk, tokenMgmtRef, key, token);
}

function get(storage, key) {
  var tokenStorage = storage.getStorage();
  return tokenStorage[key];
}

function getKeyByType(storage, type: TokenType): string {
  const tokenStorage = storage.getStorage();
  const key = Object.keys(tokenStorage).filter(key => {
    const token = tokenStorage[key];
    return (isAccessToken(token) && type === 'accessToken') 
      || (isIDToken(token) && type === 'idToken')
      || (isRefreshToken(token) && type === 'refreshToken');
  })[0];
  return key;
}

function getAsync(storage, key) {
  return new Promise(function(resolve) {
    var token = get(storage, key);
    return resolve(token);
  });
}

function getTokens(storage): Tokens {
  const tokens = {} as Tokens;
  const tokenStorage = storage.getStorage();
  Object.keys(tokenStorage).forEach(key => {
    const token = tokenStorage[key];
    if (isAccessToken(token)) {
      tokens.accessToken = token;
    } else if (isIDToken(token)) {
      tokens.idToken = token;
    } else if (isRefreshToken(token)) { 
      tokens.refreshToken = token;
    }
  });
  return tokens;
}

function getTokensAsync(storage): Promise<Tokens> {
  return new Promise((resolve) => {
    const tokens = getTokens(storage);
    return resolve(tokens);
  });
}

/* eslint-disable max-params */
function setTokens(
  sdk, 
  tokenMgmtRef, 
  storage, 
  { accessToken, idToken, refreshToken }: Tokens, 
  accessTokenCb?: Function, 
  idTokenCb?: Function,
  refreshTokenCb?: Function
): void {
  const handleAdded = (key, token, tokenCb) => {
    emitAdded(tokenMgmtRef, key, token);
    setExpireEventTimeout(sdk, tokenMgmtRef, key, token);
    if (tokenCb) {
      tokenCb(key, token);
    }
  };
  const handleRemoved = (key, token, tokenCb) => {
    clearExpireEventTimeout(tokenMgmtRef, key);
    emitRemoved(tokenMgmtRef, key, token);
    if (tokenCb) {
      tokenCb(key, token);
    }
  };

  if (idToken) {
    validateToken(idToken);
  }
  if (accessToken) {
    validateToken(accessToken);
  }
  const idTokenKey = getKeyByType(storage, 'idToken') || ID_TOKEN_STORAGE_KEY;
  const accessTokenKey = getKeyByType(storage, 'accessToken') || ACCESS_TOKEN_STORAGE_KEY;
  const refreshTokenKey = getKeyByType(storage, 'refreshToken') || REFRESH_TOKEN_STORAGE_KEY;

  // add token to storage
  const tokenStorage = { 
    ...(idToken && { [idTokenKey]: idToken }),
    ...(accessToken && { [accessTokenKey]: accessToken }),
    ...(refreshToken && { [refreshTokenKey]: refreshToken })
  };
  storage.setStorage(tokenStorage);

  // emit event and start expiration timer
  const existingTokens = getTokens(storage);
  if (idToken) {
    handleAdded(idTokenKey, idToken, idTokenCb);
  } else if (existingTokens.idToken) {
    handleRemoved(idTokenKey, existingTokens.idToken, idTokenCb);
  }
  if (accessToken) {
    handleAdded(accessTokenKey, accessToken, accessTokenCb);
  } else if (existingTokens.accessToken) {
    handleRemoved(accessTokenKey, existingTokens.accessToken, accessTokenCb);
  }
  if (refreshToken) {
    handleAdded(refreshTokenKey, refreshToken, refreshTokenCb);
  } else if (existingTokens.refreshToken) {
    handleRemoved(refreshTokenKey, existingTokens.refreshToken, refreshTokenCb);
  }
}
/* eslint-enable max-params */

function remove(tokenMgmtRef, storage, key) {
  // Clear any listener for this token
  clearExpireEventTimeout(tokenMgmtRef, key);

  var tokenStorage = storage.getStorage();
  var removedToken = tokenStorage[key];
  delete tokenStorage[key];
  storage.setStorage(tokenStorage);

  emitRemoved(tokenMgmtRef, key, removedToken);
}

function renew(sdk, tokenMgmtRef, storage, key) {
  // Multiple callers may receive the same promise. They will all resolve or reject from the same request.
  var existingPromise = tokenMgmtRef.renewPromise[key];
  if (existingPromise) {
    return existingPromise;
  }

  try {
    var token = get(storage, key);
    if (!token) {
      throw new AuthSdkError('The tokenManager has no token for the key: ' + key);
    }
  } catch (e) {
    return Promise.reject(e);
  }

  // Remove existing autoRenew timeouts
  clearExpireEventTimeoutAll(tokenMgmtRef);

  // A refresh token means a replace instead of renewal

  // Store the renew promise state, to avoid renewing again
  // Renew/refresh all tokens in one process
  tokenMgmtRef.renewPromise[key] = sdk.token.renewTokens({
    scopes: token.scopes,
  })
    .then(function(freshTokens) {
      // store and emit events for freshTokens
      const oldTokenStorage = storage.getStorage();
      setTokens(
        sdk, 
        tokenMgmtRef, 
        storage, 
        freshTokens, 
        (accessTokenKey, accessToken) =>
          emitRenewed(tokenMgmtRef, accessTokenKey, accessToken, oldTokenStorage[accessTokenKey]),
        (idTokenKey, idToken) =>
          emitRenewed(tokenMgmtRef, idTokenKey, idToken, oldTokenStorage[idTokenKey]),
        // not emitting refresh token as an internal detail, not a usable token
      );

      // return freshToken by key
      const freshToken = get(storage, key);
      return freshToken;
    })
    .catch(function(err) {
      if (err.name === 'OAuthError' || err.name === 'AuthSdkError') {
        // remove expired tokens in storage
        const removedTokens = [];
        const tokenStorage = storage.getStorage();
        Object.keys(tokenStorage).forEach(key => {
          const token = tokenStorage[key];
          if (token && hasExpired(tokenMgmtRef, token)) {
            delete tokenStorage[key];
            removedTokens.push({ key, token });
            clearExpireEventTimeout(tokenMgmtRef, key);
          }
        });
        storage.setStorage(tokenStorage);
        // emit removed events
        if (!removedTokens.length) {
          // tokens have been removed from other tabs
          // still trigger removed event for downstream listeners
          emitRemoved(tokenMgmtRef, ID_TOKEN_STORAGE_KEY);
          emitRemoved(tokenMgmtRef, ACCESS_TOKEN_STORAGE_KEY);
        } else {
          removedTokens.forEach((key, token) => emitRemoved(tokenMgmtRef, key, token));
        }

        err.tokenKey = key;
        emitError(tokenMgmtRef, err);
      }
      throw err;
    })
    .finally(function() {
      // Remove existing promise key
      delete tokenMgmtRef.renewPromise[key];
    });

  return tokenMgmtRef.renewPromise[key];
}

function clear(tokenMgmtRef, storage) {
  clearExpireEventTimeoutAll(tokenMgmtRef);
  storage.clearStorage();
}

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

function getTokensFromStorageValue(value) {
  let tokens;
  try {
    tokens = JSON.parse(value) || {};
  } catch (e) {
    tokens = {};
  }
  return tokens;
}

export class TokenManager {
  get: (key: string) => Promise<Token>;
  add: (key: string, token: Token) => void;
  clear: () => void;
  remove: (key: string) => void;
  renew: (key: string) => Promise<Token>;
  on: (event: string, handler: Function, context?: object) => void;
  off: (event: string, handler: Function) => void;
  hasExpired: (token: Token) => boolean;
  getTokens: () => Promise<Tokens>;
  setTokens: (tokens: Tokens) => void;
  
  // This is exposed so we can get storage key agnostic tokens set in internal state managers
  _getStorageKeyByType: (type: TokenType) => string;
  // This is exposed so we can set clear timeouts in our tests
  _clearExpireEventTimeoutAll: () => void;
  // This is exposed read-only options for internal sdk use
  _getOptions: () => TokenManagerOptions;
  // Expose cross tabs communication helper functions to tests
  _resetExpireEventTimeoutAll: () => void;
  _emitEventsForCrossTabsStorageUpdate: (newValue: string, oldValue: string) => void;

  constructor(sdk: OktaAuth, options: TokenManagerOptions) {
    options = Object.assign({}, DEFAULT_OPTIONS, removeNils(options));

    const emitter = (sdk as any).emitter;
    if (!emitter) {
      throw new AuthSdkError('Emitter should be initialized before TokenManager');
    }

    if (isIE11OrLess()) {
      options._storageEventDelay = options._storageEventDelay || 1000;
    }

    const storageOptions: StorageOptions = removeNils({
      storageKey: options.storageKey,
      secure: options.secure
    });
    if (typeof options.storage === 'object') {
      // A custom storage provider must implement getItem(key) and setItem(key, val)
      storageOptions.storageProvider = options.storage;
    } else if (options.storage) {
      storageOptions.storageType = options.storage as StorageType;
    }

    const storage = sdk.storageManager.getTokenStorage(storageOptions);

    var clock = SdkClock.create(/* sdk, options */);
    var tokenMgmtRef = {
      clock: clock,
      options: options,
      emitter: emitter,
      expireTimeouts: {},
      renewPromise: {}
    };

    this.add = add.bind(this, sdk, tokenMgmtRef, storage);
    this.get = getAsync.bind(this, storage);
    this.remove = remove.bind(this, tokenMgmtRef, storage);
    this.clear = clear.bind(this, tokenMgmtRef, storage);
    this.renew = renew.bind(this, sdk, tokenMgmtRef, storage);
    this.on = tokenMgmtRef.emitter.on.bind(tokenMgmtRef.emitter);
    this.off = tokenMgmtRef.emitter.off.bind(tokenMgmtRef.emitter);
    this.hasExpired = hasExpired.bind(this, tokenMgmtRef);
    this.getTokens = getTokensAsync.bind(this, storage);
    this.setTokens = setTokens.bind(this, sdk, tokenMgmtRef, storage);
    this._getStorageKeyByType = getKeyByType.bind(this, storage);
    this._clearExpireEventTimeoutAll = clearExpireEventTimeoutAll.bind(this, tokenMgmtRef);
    this._getOptions = () => clone(options);
    this._resetExpireEventTimeoutAll = resetExpireEventTimeoutAll.bind(this, sdk, tokenMgmtRef, storage);
    this._emitEventsForCrossTabsStorageUpdate = emitEventsForCrossTabsStorageUpdate.bind(this, tokenMgmtRef);
  
    const renewTimeQueue = [];
    const onTokenExpiredHandler = (key) => {
      if (options.autoRenew) {
        if (shouldThrottleRenew(renewTimeQueue)) {
          const error = new AuthSdkError('Too many token renew requests');
          emitError(tokenMgmtRef, error);
        } else {
          this.renew(key).catch(() => {}); // Renew errors will emit an "error" event 
        }
      } else if (options.autoRemove) {
        this.remove(key);
      }
    };
    this.on(EVENT_EXPIRED, onTokenExpiredHandler);

    setExpireEventTimeoutAll(sdk, tokenMgmtRef, storage);

    // Sync authState cross multiple tabs when localStorage is used as the storageProvider
    // A StorageEvent is sent to a window when a storage area it has access to is changed 
    // within the context of another document.
    // https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
    window.addEventListener('storage', ({ key, newValue, oldValue }: StorageEvent) => {
      const handleCrossTabsStorageChange = () => {
        this._resetExpireEventTimeoutAll();
        this._emitEventsForCrossTabsStorageUpdate(newValue, oldValue);
      };

      // Skip if:
      // not from localStorage.clear (event.key is null)
      // event.key is not the storageKey
      // oldValue === newValue
      if (key && (key !== options.storageKey || newValue === oldValue)) {
        return;
      }

      // LocalStorage cross tabs update is not synced in IE, set a 1s timer by default to read latest value
      // https://stackoverflow.com/questions/24077117/localstorage-in-win8-1-ie11-does-not-synchronize
      setTimeout(() => handleCrossTabsStorageChange(), options._storageEventDelay);
    });
  }
}
