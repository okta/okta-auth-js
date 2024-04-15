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
import { removeNils, clone } from '../util';
import { AuthSdkError } from '../errors';
import { validateToken  } from '../oidc/util';
import { isLocalhost, isIE11OrLess } from '../features';
import SdkClock from '../clock';
import {
  Token, 
  Tokens, 
  TokenType, 
  TokenManagerOptions, 
  isIDToken, 
  isAccessToken,
  isRefreshToken,
  TokenManagerErrorEventHandler,
  TokenManagerSetStorageEventHandler,
  TokenManagerRenewEventHandler,
  TokenManagerEventHandler,
  TokenManagerInterface,
  RefreshToken,
  AccessTokenCallback,
  IDTokenCallback,
  RefreshTokenCallback,
  EVENT_RENEWED,
  EVENT_ADDED,
  EVENT_ERROR,
  EVENT_EXPIRED,
  EVENT_REMOVED,
  EVENT_SET_STORAGE,
  TokenManagerAnyEventHandler,
  TokenManagerAnyEvent,
  OktaAuthOAuthInterface
} from './types';
import { REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_NAME } from '../constants';
import { EventEmitter } from '../base/types';
import { StorageOptions, StorageProvider, StorageType } from '../storage/types';

const DEFAULT_OPTIONS = {
  // TODO: remove in next major version - OKTA-473815
  autoRenew: true,
  autoRemove: true,
  syncStorage: true,
  // --- //
  clearPendingRemoveTokens: true,
  storage: undefined, // will use value from storageManager config
  expireEarlySeconds: 30,
  storageKey: TOKEN_STORAGE_NAME
};

interface TokenManagerState {
  expireTimeouts: Record<string, unknown>;
  renewPromise: Promise<Token | undefined> | null;
  started?: boolean;
}
function defaultState(): TokenManagerState {
  return {
    expireTimeouts: {},
    renewPromise: null
  };
}
export class TokenManager implements TokenManagerInterface {
  private sdk: OktaAuthOAuthInterface;
  private clock: SdkClock;
  private emitter: EventEmitter;
  private storage: StorageProvider;
  private state: TokenManagerState;
  private options: TokenManagerOptions;

  on(event: typeof EVENT_RENEWED, handler: TokenManagerRenewEventHandler, context?: object): void;
  on(event: typeof EVENT_ERROR, handler: TokenManagerErrorEventHandler, context?: object): void;
  on(event: typeof EVENT_SET_STORAGE, handler: TokenManagerSetStorageEventHandler, context?: object): void;
  on(event: typeof EVENT_EXPIRED | typeof EVENT_ADDED | typeof EVENT_REMOVED, 
    handler: TokenManagerEventHandler, context?: object): void;
  on(event: TokenManagerAnyEvent, handler: TokenManagerAnyEventHandler, context?: object): void {
    if (context) {
      this.emitter.on(event, handler, context);
    } else {
      this.emitter.on(event, handler);
    }
  }

  off(event: typeof EVENT_RENEWED, handler?: TokenManagerRenewEventHandler): void;
  off(event: typeof EVENT_ERROR, handler?: TokenManagerErrorEventHandler): void;
  off(event: typeof EVENT_SET_STORAGE, handler?: TokenManagerSetStorageEventHandler): void;
  off(event: typeof EVENT_EXPIRED | typeof EVENT_ADDED | typeof EVENT_REMOVED, 
    handler?: TokenManagerEventHandler): void;
  off(event: TokenManagerAnyEvent, handler?: TokenManagerAnyEventHandler): void {
    if (handler) {
      this.emitter.off(event, handler);
    } else {
      this.emitter.off(event);
    }
  }

  // eslint-disable-next-line complexity
  constructor(sdk: OktaAuthOAuthInterface, options: TokenManagerOptions = {}) {
    this.sdk = sdk;
    this.emitter = (sdk as any).emitter;
    if (!this.emitter) {
      throw new AuthSdkError('Emitter should be initialized before TokenManager');
    }
    
    options = Object.assign({}, DEFAULT_OPTIONS, removeNils(options));
    if (!isLocalhost()) {
      options.expireEarlySeconds = DEFAULT_OPTIONS.expireEarlySeconds;
    }

    this.options = options;

    const storageOptions: StorageOptions = removeNils({
      storageKey: options.storageKey,
      secure: options.secure,
    });
    if (typeof options.storage === 'object') {
      // A custom storage provider must implement getItem(key) and setItem(key, val)
      storageOptions.storageProvider = options.storage;
    } else if (options.storage) {
      storageOptions.storageType = options.storage as StorageType;
    }

    this.storage = sdk.storageManager.getTokenStorage({...storageOptions, useSeparateCookies: true});
    this.clock = SdkClock.create(/* sdk, options */);
    this.state = defaultState();
  }

  start() {
    if (this.options.clearPendingRemoveTokens) {
      this.clearPendingRemoveTokens();
    }
    this.setExpireEventTimeoutAll();
    this.state.started = true;
  }
  
  stop() {
    this.clearExpireEventTimeoutAll();
    this.state.started = false;
  }

  isStarted() {
    return !!this.state.started;
  }

  getOptions(): TokenManagerOptions {
    return clone(this.options);
  }
  
  getExpireTime(token) {
    const expireEarlySeconds = this.options.expireEarlySeconds || 0;
    var expireTime = token.expiresAt - expireEarlySeconds;
    return expireTime;
  }
  
  hasExpired(token) {
    var expireTime = this.getExpireTime(token);
    return expireTime <= this.clock.now();
  }
  
  emitExpired(key, token) {
    this.emitter.emit(EVENT_EXPIRED, key, token);
  }
  
  emitRenewed(key, freshToken, oldToken) {
    this.emitter.emit(EVENT_RENEWED, key, freshToken, oldToken);
  }
  
  emitAdded(key, token) {
    this.emitter.emit(EVENT_ADDED, key, token);
  }
  
  emitRemoved(key, token?) {
    this.emitter.emit(EVENT_REMOVED, key, token);
  }
  
  emitError(error) {
    this.emitter.emit(EVENT_ERROR, error);
  }
  
  clearExpireEventTimeout(key) {
    clearTimeout(this.state.expireTimeouts[key] as any);
    delete this.state.expireTimeouts[key];
  
    // Remove the renew promise (if it exists)
    this.state.renewPromise = null;
  }
  
  clearExpireEventTimeoutAll() {
    var expireTimeouts = this.state.expireTimeouts;
    for (var key in expireTimeouts) {
      if (!Object.prototype.hasOwnProperty.call(expireTimeouts, key)) {
        continue;
      }
      this.clearExpireEventTimeout(key);
    }
  }
  
  setExpireEventTimeout(key, token) {
    if (isRefreshToken(token)) {
      return;
    }

    var expireTime = this.getExpireTime(token);
    var expireEventWait = Math.max(expireTime - this.clock.now(), 0) * 1000;
  
    // Clear any existing timeout
    this.clearExpireEventTimeout(key);
  
    var expireEventTimeout = setTimeout(() => {
      this.emitExpired(key, token);
    }, expireEventWait);
  
    // Add a new timeout
    this.state.expireTimeouts[key] = expireEventTimeout;
  }
  
  setExpireEventTimeoutAll() {
    var tokenStorage = this.storage.getStorage();
    for(var key in tokenStorage) {
      if (!Object.prototype.hasOwnProperty.call(tokenStorage, key)) {
        continue;
      }
      var token = tokenStorage[key];
      this.setExpireEventTimeout(key, token);
    }
  }
  
  // reset timeouts to setup autoRenew for tokens from other document context (tabs)
  resetExpireEventTimeoutAll() {
    this.clearExpireEventTimeoutAll();
    this.setExpireEventTimeoutAll();
  }
  
  add(key, token: Token) {
    var tokenStorage = this.storage.getStorage();
    validateToken(token);
    tokenStorage[key] = token;
    this.storage.setStorage(tokenStorage);
    this.emitSetStorageEvent();
    this.emitAdded(key, token);
    this.setExpireEventTimeout(key, token);
  }
  
  getSync(key): Token | undefined {
    var tokenStorage = this.storage.getStorage();
    return tokenStorage[key];
  }
  
  async get(key): Promise<Token | undefined> {
    return this.getSync(key);
  }
  
  getTokensSync(): Tokens {
    const tokens = {} as Tokens;
    const tokenStorage = this.storage.getStorage();
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
  
  async getTokens(): Promise<Tokens> {
    return this.getTokensSync();
  }

  getStorageKeyByType(type: TokenType): string {
    const tokenStorage = this.storage.getStorage();
    const key = Object.keys(tokenStorage).filter(key => {
      const token = tokenStorage[key];
      return (isAccessToken(token) && type === 'accessToken') 
        || (isIDToken(token) && type === 'idToken')
        || (isRefreshToken(token) && type === 'refreshToken');
    })[0];
    return key;
  }

  private getTokenType(token: Token): TokenType {
    if (isAccessToken(token)) {
      return 'accessToken';
    }
    if (isIDToken(token)) {
      return 'idToken';
    }
    if(isRefreshToken(token)) {
      return 'refreshToken';
    }
    throw new AuthSdkError('Unknown token type');
  }

  // for synchronization of LocalStorage cross tabs for IE11
  private emitSetStorageEvent() {
    if (isIE11OrLess()) {
      const storage = this.storage.getStorage();
      this.emitter.emit(EVENT_SET_STORAGE, storage);
    }
  }

  // used in `SyncStorageService` for synchronization of LocalStorage cross tabs for IE11
  public getStorage() {
    return this.storage;
  }

  setTokens(
    tokens: Tokens,
    // TODO: callbacks can be removed in the next major version OKTA-407224
    accessTokenCb?: AccessTokenCallback, 
    idTokenCb?: IDTokenCallback,
    refreshTokenCb?: RefreshTokenCallback
  ): void {
    const handleTokenCallback = (key, token) => {
      const type = this.getTokenType(token);
      if (type === 'accessToken') {
        accessTokenCb && accessTokenCb(key, token);
      } else if (type === 'idToken') {
        idTokenCb && idTokenCb(key, token);
      } else if (type === 'refreshToken') {
        refreshTokenCb && refreshTokenCb(key, token);
      }
    };
    const handleAdded = (key, token) => {
      this.emitAdded(key, token);
      this.setExpireEventTimeout(key, token);
      handleTokenCallback(key, token);
    };
    const handleRenewed = (key, token, oldToken) => {
      this.emitRenewed(key, token, oldToken);
      this.clearExpireEventTimeout(key);
      this.setExpireEventTimeout(key, token);
      handleTokenCallback(key, token);
    };
    const handleRemoved = (key, token) => {
      this.clearExpireEventTimeout(key);
      this.emitRemoved(key, token);
      handleTokenCallback(key, token);
    };
    
    const types: TokenType[] = ['idToken', 'accessToken', 'refreshToken'];
    const existingTokens = this.getTokensSync();

    // valid tokens
    types.forEach((type) => {
      const token = tokens[type];
      if (token) {
        validateToken(token, type);
      }
    });
  
    // add token to storage
    const storage = types.reduce((storage, type) => {
      const token = tokens[type];
      if (token) {
        const storageKey = this.getStorageKeyByType(type) || type;
        storage[storageKey] = token;
      }
      return storage;
    }, {});
    this.storage.setStorage(storage);
    this.emitSetStorageEvent();

    // emit event and start expiration timer
    types.forEach(type => {
      const newToken = tokens[type];
      const existingToken = existingTokens[type];
      const storageKey = this.getStorageKeyByType(type) || type;
      if (newToken && existingToken) { // renew
        // call handleRemoved first, since it clears timers
        handleRemoved(storageKey, existingToken);
        handleAdded(storageKey, newToken);
        handleRenewed(storageKey, newToken, existingToken);
      } else if (newToken) { // add
        handleAdded(storageKey, newToken);
      } else if (existingToken) { //remove
        handleRemoved(storageKey, existingToken);
      }
    });
  }
  
  remove(key) {
    // Clear any listener for this token
    this.clearExpireEventTimeout(key);
  
    var tokenStorage = this.storage.getStorage();
    var removedToken = tokenStorage[key];
    delete tokenStorage[key];
    this.storage.setStorage(tokenStorage);
    this.emitSetStorageEvent();
  
    this.emitRemoved(key, removedToken);
  }
  
  // TODO: this methods is redundant and can be removed in the next major version OKTA-407224
  async renewToken(token) {
    return this.sdk.token?.renew(token);
  }
  // TODO: this methods is redundant and can be removed in the next major version OKTA-407224
  validateToken(token: Token) {
    return validateToken(token);
  }

  // TODO: renew method should take no param, change in the next major version OKTA-407224
  renew(key): Promise<Token | undefined> {
    // Multiple callers may receive the same promise. They will all resolve or reject from the same request.
    if (this.state.renewPromise) {
      return this.state.renewPromise;
    }

    try {
      var token = this.getSync(key);
      let shouldRenew = token !== undefined;
      // explicitly check if key='accessToken' because token keys are not guaranteed (long story, features dragons)
      if (!token && key === 'accessToken') {
        // attempt token renewal if refresh token is present (improves consistency of autoRenew)
        const refreshKey = this.getStorageKeyByType('refreshToken');
        const refreshToken = this.getSync(refreshKey);
        shouldRenew = refreshToken !== undefined;
      }

      if (!shouldRenew) {
        throw new AuthSdkError('The tokenManager has no token for the key: ' + key);
      }
    }
    catch (err) {
      this.emitError(err);
      return Promise.reject(err);
    }

    // Remove existing autoRenew timeout
    this.clearExpireEventTimeout(key);
  
    // A refresh token means a replace instead of renewal
    // Store the renew promise state, to avoid renewing again
    const renewPromise = this.state.renewPromise = this.sdk.token.renewTokens()
      .then(tokens => {
        this.setTokens(tokens);

        // return accessToken in case where access token doesn't exist
        // but refresh token exists
        if (!token && key === 'accessToken') {
          const accessToken = tokens['accessToken'];
          this.emitRenewed(key, accessToken, null);
          return accessToken;
        }

        // resolve token based on the key
        const tokenType = this.getTokenType(token!);
        return tokens[tokenType];
      })
      .catch(err => {
        // If renew fails, remove token from storage and emit error
        this.remove(key);
        err.tokenKey = key;
        this.emitError(err);
        throw err;
      })
      .finally(() => {
        // Remove existing promise key
        this.state.renewPromise = null;
      });
  
    return renewPromise;
  }
  
  clear() {
    const tokens = this.getTokensSync();
    this.clearExpireEventTimeoutAll();
    this.storage.clearStorage();
    this.emitSetStorageEvent();

    Object.keys(tokens).forEach(key => {
      this.emitRemoved(key, tokens[key]);
    });
  }

  clearPendingRemoveTokens() {
    const tokenStorage = this.storage.getStorage();
    const removedTokens = {};
    Object.keys(tokenStorage).forEach(key => {
      if (tokenStorage[key].pendingRemove) {
        removedTokens[key] = tokenStorage[key];
        delete tokenStorage[key];
      }
    });
    this.storage.setStorage(tokenStorage);
    this.emitSetStorageEvent();
    Object.keys(removedTokens).forEach(key => {
      this.clearExpireEventTimeout(key);
      this.emitRemoved(key, removedTokens[key]);
    });
  }

  updateRefreshToken(token: RefreshToken) {
    const key = this.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY;

    // do not emit any event
    var tokenStorage = this.storage.getStorage();
    validateToken(token);
    tokenStorage[key] = token;
    this.storage.setStorage(tokenStorage);
    this.emitSetStorageEvent();
  }

  removeRefreshToken () {
    const key = this.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY;
    this.remove(key);
  }

  addPendingRemoveFlags() {
    const tokens = this.getTokensSync();
    Object.keys(tokens).forEach(key => {
      tokens[key].pendingRemove = true;
    });
    this.setTokens(tokens);
  }
  
}
