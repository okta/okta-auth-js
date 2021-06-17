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
import { removeNils, warn, clone } from './util';
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
  StorageProvider
} from './types';
import { ID_TOKEN_STORAGE_KEY, ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './constants';
import { TokenService } from './services/TokenService';

const DEFAULT_OPTIONS = {
  autoRenew: true,
  autoRemove: true,
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
interface TokenError {
  errorSummary: string;
  errorCode: string;
  message: string;
  name: string;
  tokenKey: string;
}
type TokenErrorEventHandler = (error: TokenError) => void;
type TokenEventHandler = (key: string, token: Token, oldtoken?: Token) => void;
interface TokenManagerState {
  expireTimeouts: Record<string, unknown>;
  renewPromise: Record<string, Promise<Token>>;
}
function defaultState(): TokenManagerState {
  return {
    expireTimeouts: {},
    renewPromise: {}
  };
}
export class TokenManager {
  private sdk: OktaAuth;
  private clock: SdkClock;
  private emitter: EventEmitter;
  private storage: StorageProvider;
  private state: TokenManagerState;
  private options: TokenManagerOptions;
  private service: TokenService;

  on: (event: string, handler: TokenErrorEventHandler | TokenEventHandler, context?: object) => void;
  off: (event: string, handler?: TokenErrorEventHandler | TokenEventHandler) => void;

  constructor(sdk: OktaAuth, options: TokenManagerOptions = {}) {
    this.sdk = sdk;
    this.emitter = (sdk as any).emitter;
    if (!this.emitter) {
      throw new AuthSdkError('Emitter should be initialized before TokenManager');
    }

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

    this.storage = sdk.storageManager.getTokenStorage(storageOptions);
    this.clock = SdkClock.create(/* sdk, options */);
    this.state = defaultState();

    this.on = this.emitter.on.bind(this.emitter);
    this.off = this.emitter.off.bind(this.emitter);
  }

  start() {
    if (this.service) {
      this.stop();
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
    var expireTime = token.expiresAt - this.options.expireEarlySeconds;
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
    delete this.state.renewPromise[key];
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
      if (isRefreshToken(token)) {
        continue;
      }
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

  // eslint-disable-next-line complexity
  setTokens(
    { accessToken, idToken, refreshToken }: Tokens, 
    accessTokenCb?: Function, 
    idTokenCb?: Function,
    refreshTokenCb?: Function
  ): void {
    const handleAdded = (key, token, tokenCb) => {
      this.emitAdded(key, token);
      this.setExpireEventTimeout(key, token);
      if (tokenCb) {
        tokenCb(key, token);
      }
    };
    const handleRemoved = (key, token, tokenCb) => {
      this.clearExpireEventTimeout(key);
      this.emitRemoved(key, token);
      if (tokenCb) {
        tokenCb(key, token);
      }
    };
  
    if (idToken) {
      validateToken(idToken, 'idToken');
    }
    if (accessToken) {
      validateToken(accessToken, 'accessToken');
    }
    if (refreshToken) {
      validateToken(refreshToken, 'refreshToken');
    }
    const idTokenKey = this.getStorageKeyByType('idToken') || ID_TOKEN_STORAGE_KEY;
    const accessTokenKey = this.getStorageKeyByType('accessToken') || ACCESS_TOKEN_STORAGE_KEY;
    const refreshTokenKey = this.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY;
  
    // add token to storage
    const tokenStorage = { 
      ...(idToken && { [idTokenKey]: idToken }),
      ...(accessToken && { [accessTokenKey]: accessToken }),
      ...(refreshToken && { [refreshTokenKey]: refreshToken })
    };
    this.storage.setStorage(tokenStorage);
  
    // emit event and start expiration timer
    const existingTokens = this.getTokensSync();
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
  
  removeAll() {
    const tokenStorage = this.storage.getStorage();
    Object.keys(tokenStorage).forEach(key => {
      this.remove(key);
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
  
  // TODO: these methods are redundant and can be removed in the next major version
  async renewToken(token) {
    return this.sdk.token.renew(token);
  }
  validateToken(token: Token) {
    return validateToken(token);
  }
  

  renew(key): Promise<Token> {
    // Multiple callers may receive the same promise. They will all resolve or reject from the same request.
    var existingPromise = this.state.renewPromise[key];
    if (existingPromise) {
      return existingPromise;
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
    this.state.renewPromise[key] = this.sdk.token.renew(token)
      .then(freshToken => {
        // store and emit events for freshToken
        const oldTokenStorage = this.storage.getStorage();
        this.remove(key);
        this.add(key, freshToken);
        this.emitRenewed(key, freshToken, oldTokenStorage[key]);
        return freshToken;
      })
      .catch(err => {
        // If renew fails, remove token and emit error
        if (isRefreshTokenError(err) || err.name === 'OAuthError' || err.name === 'AuthSdkError') {
          // remove token from storage
          this.remove(key);
          
          err.tokenKey = key;
          this.emitError(err);
        }
        throw err;
      })
      .finally(() => {
        // Remove existing promise key
        delete this.state.renewPromise[key];
      });
  
    return this.state.renewPromise[key];
  }
  
  clear() {
    this.clearExpireEventTimeoutAll();
    this.storage.clearStorage();
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
}

if (isLocalhost()) {
  (function addWarningsForLocalhost() {
    const { add } = TokenManager.prototype;
    Object.assign(TokenManager.prototype, {
      add: function(key, token: Token) {
        warn(
          'Use setTokens() instead if you want to add a set of tokens at same time.\n' + 
          'It prevents current tab from emitting unnecessary StorageEvent,\n' + 
          'which may cause false-positive authState change cross tabs.'
        );
        add.call(this, key, token);
      }
    });
  })();
}
