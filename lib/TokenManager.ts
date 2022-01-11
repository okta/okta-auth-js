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
import { removeNils, clone } from './util';
import { AuthSdkError } from './errors';
import { isRefreshTokenError, validateToken  } from './oidc/util';
import { isLocalhost, isIE11OrLess } from './features';
import { TOKEN_STORAGE_NAME } from './constants';
import SdkClock from './clock';
import {
  EventEmitter,
  Token, 
  Tokens, 
  TokenType, 
  TokenManagerOptions, 
  isIDToken, 
  isAccessToken,
  isRefreshToken,
  StorageOptions,
  StorageType,
  OktaAuth,
  StorageProvider,
  TokenManagerErrorEventHandler,
  TokenManagerEventHandler,
  TokenManagerInterface,
  RefreshToken
} from './types';
import { REFRESH_TOKEN_STORAGE_KEY } from './constants';
import { TokenService } from './services/TokenService';

const DEFAULT_OPTIONS = {
  autoRenew: true,
  autoRemove: true,
  clearPendingRemoveTokens: true,
  storage: undefined, // will use value from storageManager config
  expireEarlySeconds: 30,
  storageKey: TOKEN_STORAGE_NAME,
  syncStorage: true,
  _storageEventDelay: 0
};
export const EVENT_EXPIRED = 'expired';
export const EVENT_RENEWED = 'renewed';
export const EVENT_ADDED = 'added';
export const EVENT_REMOVED = 'removed';
export const EVENT_ERROR = 'error';

interface TokenManagerState {
  expireTimeouts: Record<string, unknown>;
  renewPromise: Promise<Token | undefined> | null;
}
function defaultState(): TokenManagerState {
  return {
    expireTimeouts: {},
    renewPromise: null
  };
}
export class TokenManager implements TokenManagerInterface {
  private sdk: OktaAuth;
  private clock: SdkClock;
  private emitter: EventEmitter;
  private storage: StorageProvider;
  private state: TokenManagerState;
  private options: TokenManagerOptions;
  private service: TokenService | null;

  on: (event: string, handler: TokenManagerErrorEventHandler | TokenManagerEventHandler, context?: object) => void;
  off: (event: string, handler?: TokenManagerErrorEventHandler | TokenManagerEventHandler) => void;

  constructor(sdk: OktaAuth, options: TokenManagerOptions = {}) {
    this.sdk = sdk;
    this.emitter = (sdk as any).emitter;
    if (!this.emitter) {
      throw new AuthSdkError('Emitter should be initialized before TokenManager');
    }
    this.service = null;
    
    options = Object.assign({}, DEFAULT_OPTIONS, removeNils(options));
    if (isIE11OrLess()) {
      options._storageEventDelay = options._storageEventDelay || 1000;
    }
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

    this.on = this.emitter.on.bind(this.emitter);
    this.off = this.emitter.off.bind(this.emitter);
  }

  start() {
    if (this.service) {
      this.stop();
    }
    if (this.options.clearPendingRemoveTokens) {
      this.clearPendingRemoveTokens();
    }
    this.service = new TokenService(this, this.getOptions());
    this.service.start();
  }
  
  stop() {
    if (this.service) {
      this.service.stop();
      this.service = null;
    }
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
  
  emitEventsForCrossTabsStorageUpdate(newValue, oldValue) {
    const oldTokens = this.getTokensFromStorageValue(oldValue);
    const newTokens = this.getTokensFromStorageValue(newValue);
    Object.keys(newTokens).forEach(key => {
      const oldToken = oldTokens[key];
      const newToken = newTokens[key];
      if (JSON.stringify(oldToken) !== JSON.stringify(newToken)) {
        this.emitAdded(key, newToken);
      }
    });
    Object.keys(oldTokens).forEach(key => {
      const oldToken = oldTokens[key];
      const newToken = newTokens[key];
      if (!newToken) {
        this.emitRemoved(key, oldToken);
      }
    });
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
    this.emitAdded(key, token);
    this.setExpireEventTimeout(key, token);
  }
  
  getSync(key) {
    var tokenStorage = this.storage.getStorage();
    return tokenStorage[key];
  }
  
  async get(key) {
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

  setTokens(
    tokens: Tokens,
    // TODO: callbacks can be removed in the next major version OKTA-407224
    accessTokenCb?: Function, 
    idTokenCb?: Function,
    refreshTokenCb?: Function
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
      if (!token) {
        throw new AuthSdkError('The tokenManager has no token for the key: ' + key);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  
    // Remove existing autoRenew timeout
    this.clearExpireEventTimeout(key);
  
    // A refresh token means a replace instead of renewal
    // Store the renew promise state, to avoid renewing again
    this.state.renewPromise = this.sdk.token.renewTokens()
      .then(tokens => {
        this.setTokens(tokens);

        // resolve token based on the key
        const tokenType = this.getTokenType(token);
        return tokens[tokenType];
      })
      .catch(err => {
        // If renew fails, remove token and emit error
        if (isRefreshTokenError(err) || err.name === 'OAuthError' || err.name === 'AuthSdkError') {
          // remove token from storage
          this.remove(key);
        }
        err.tokenKey = key;
        this.emitError(err);
        throw err;
      })
      .finally(() => {
        // Remove existing promise key
        this.state.renewPromise = null;
      });
  
    return this.state.renewPromise;
  }
  
  clear() {
    this.clearExpireEventTimeoutAll();
    this.storage.clearStorage();
  }

  clearPendingRemoveTokens() {
    const tokens = this.getTokensSync();
    Object.keys(tokens).forEach(key => {
      if (tokens[key].pendingRemove) {
       this.remove(key);
      }
    });
  }
  
  getTokensFromStorageValue(value) {
    let tokens;
    try {
      tokens = JSON.parse(value) || {};
    } catch (e) {
      tokens = {};
    }
    return tokens;
  }

  updateRefreshToken(token: RefreshToken) {
    const key = this.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY;

    // do not emit any event
    var tokenStorage = this.storage.getStorage();
    validateToken(token);
    tokenStorage[key] = token;
    this.storage.setStorage(tokenStorage);
  }

  addPendingRemoveFlags() {
    const tokens = this.getTokensSync();
    Object.keys(tokens).forEach(key => {
      tokens[key].pendingRemove = true;
    });
    this.setTokens(tokens);
  }
  
}
