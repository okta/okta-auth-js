import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { isRefreshTokenError, validateToken } from './oidc/util';
import { isLocalhost, isIE11OrLess } from './features';
import { TOKEN_STORAGE_NAME } from './constants';
import SdkClock from './clock';
import { isIDToken, isAccessToken, isRefreshToken } from './types';
import { REFRESH_TOKEN_STORAGE_KEY } from './constants';
import { TokenService } from './services/TokenService';
var DEFAULT_OPTIONS = {
  autoRenew: true,
  autoRemove: true,
  storage: undefined,
  // will use value from storageManager config
  expireEarlySeconds: 30,
  storageKey: TOKEN_STORAGE_NAME,
  syncStorage: true,
  _storageEventDelay: 0
};
export var EVENT_EXPIRED = 'expired';
export var EVENT_RENEWED = 'renewed';
export var EVENT_ADDED = 'added';
export var EVENT_REMOVED = 'removed';
export var EVENT_ERROR = 'error';

function defaultState() {
  return {
    expireTimeouts: {},
    renewPromise: null
  };
}

export class TokenManager {
  constructor(sdk) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.sdk = sdk;
    this.emitter = sdk.emitter;

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
    var storageOptions = removeNils({
      storageKey: options.storageKey,
      secure: options.secure
    });

    if (typeof options.storage === 'object') {
      // A custom storage provider must implement getItem(key) and setItem(key, val)
      storageOptions.storageProvider = options.storage;
    } else if (options.storage) {
      storageOptions.storageType = options.storage;
    }

    this.storage = sdk.storageManager.getTokenStorage(storageOptions);
    this.clock = SdkClock.create();
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

  getOptions() {
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

  emitRemoved(key, token) {
    this.emitter.emit(EVENT_REMOVED, key, token);
  }

  emitError(error) {
    this.emitter.emit(EVENT_ERROR, error);
  }

  emitEventsForCrossTabsStorageUpdate(newValue, oldValue) {
    var oldTokens = this.getTokensFromStorageValue(oldValue);
    var newTokens = this.getTokensFromStorageValue(newValue);
    Object.keys(newTokens).forEach(key => {
      var oldToken = oldTokens[key];
      var newToken = newTokens[key];

      if (JSON.stringify(oldToken) !== JSON.stringify(newToken)) {
        this.emitAdded(key, newToken);
      }
    });
    Object.keys(oldTokens).forEach(key => {
      var oldToken = oldTokens[key];
      var newToken = newTokens[key];

      if (!newToken) {
        this.emitRemoved(key, oldToken);
      }
    });
  }

  clearExpireEventTimeout(key) {
    clearTimeout(this.state.expireTimeouts[key]);
    delete this.state.expireTimeouts[key]; // Remove the renew promise (if it exists)

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
    var expireEventWait = Math.max(expireTime - this.clock.now(), 0) * 1000; // Clear any existing timeout

    this.clearExpireEventTimeout(key);
    var expireEventTimeout = setTimeout(() => {
      this.emitExpired(key, token);
    }, expireEventWait); // Add a new timeout

    this.state.expireTimeouts[key] = expireEventTimeout;
  }

  setExpireEventTimeoutAll() {
    var tokenStorage = this.storage.getStorage();

    for (var key in tokenStorage) {
      if (!Object.prototype.hasOwnProperty.call(tokenStorage, key)) {
        continue;
      }

      var token = tokenStorage[key];
      this.setExpireEventTimeout(key, token);
    }
  } // reset timeouts to setup autoRenew for tokens from other document context (tabs)


  resetExpireEventTimeoutAll() {
    this.clearExpireEventTimeoutAll();
    this.setExpireEventTimeoutAll();
  }

  add(key, token) {
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

  get(key) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.getSync(key);
    })();
  }

  getTokensSync() {
    var tokens = {};
    var tokenStorage = this.storage.getStorage();
    Object.keys(tokenStorage).forEach(key => {
      var token = tokenStorage[key];

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

  getTokens() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.getTokensSync();
    })();
  }

  getStorageKeyByType(type) {
    var tokenStorage = this.storage.getStorage();
    var key = Object.keys(tokenStorage).filter(key => {
      var token = tokenStorage[key];
      return isAccessToken(token) && type === 'accessToken' || isIDToken(token) && type === 'idToken' || isRefreshToken(token) && type === 'refreshToken';
    })[0];
    return key;
  }

  getTokenType(token) {
    if (isAccessToken(token)) {
      return 'accessToken';
    }

    if (isIDToken(token)) {
      return 'idToken';
    }

    if (isRefreshToken(token)) {
      return 'refreshToken';
    }

    throw new AuthSdkError('Unknown token type');
  }

  setTokens(tokens, // TODO: callbacks can be removed in the next major version OKTA-407224
  accessTokenCb, idTokenCb, refreshTokenCb) {
    var handleTokenCallback = (key, token) => {
      var type = this.getTokenType(token);

      if (type === 'accessToken') {
        accessTokenCb && accessTokenCb(key, token);
      } else if (type === 'idToken') {
        idTokenCb && idTokenCb(key, token);
      } else if (type === 'refreshToken') {
        refreshTokenCb && refreshTokenCb(key, token);
      }
    };

    var handleAdded = (key, token) => {
      this.emitAdded(key, token);
      this.setExpireEventTimeout(key, token);
      handleTokenCallback(key, token);
    };

    var handleRenewed = (key, token, oldToken) => {
      this.emitRenewed(key, token, oldToken);
      this.clearExpireEventTimeout(key);
      this.setExpireEventTimeout(key, token);
      handleTokenCallback(key, token);
    };

    var handleRemoved = (key, token) => {
      this.clearExpireEventTimeout(key);
      this.emitRemoved(key, token);
      handleTokenCallback(key, token);
    };

    var types = ['idToken', 'accessToken', 'refreshToken'];
    var existingTokens = this.getTokensSync(); // valid tokens

    types.forEach(type => {
      var token = tokens[type];

      if (token) {
        validateToken(token, type);
      }
    }); // add token to storage

    var storage = types.reduce((storage, type) => {
      var token = tokens[type];

      if (token) {
        var storageKey = this.getStorageKeyByType(type) || type;
        storage[storageKey] = token;
      }

      return storage;
    }, {});
    this.storage.setStorage(storage); // emit event and start expiration timer

    types.forEach(type => {
      var newToken = tokens[type];
      var existingToken = existingTokens[type];
      var storageKey = this.getStorageKeyByType(type) || type;

      if (newToken && existingToken) {
        // renew
        // call handleRemoved first, since it clears timers
        handleRemoved(storageKey, existingToken);
        handleAdded(storageKey, newToken);
        handleRenewed(storageKey, newToken, existingToken);
      } else if (newToken) {
        // add
        handleAdded(storageKey, newToken);
      } else if (existingToken) {
        //remove
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
  } // TODO: this methods is redundant and can be removed in the next major version OKTA-407224


  renewToken(token) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.sdk.token.renew(token);
    })();
  } // TODO: this methods is redundant and can be removed in the next major version OKTA-407224


  validateToken(token) {
    return validateToken(token);
  } // TODO: renew method should take no param, change in the next major version OKTA-407224


  renew(key) {
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
    } // Remove existing autoRenew timeout


    this.clearExpireEventTimeout(key); // A refresh token means a replace instead of renewal
    // Store the renew promise state, to avoid renewing again

    this.state.renewPromise = this.sdk.token.renewTokens().then(tokens => {
      this.setTokens(tokens); // resolve token based on the key

      var tokenType = this.getTokenType(token);
      return tokens[tokenType];
    }).catch(err => {
      // If renew fails, remove token and emit error
      if (isRefreshTokenError(err) || err.name === 'OAuthError' || err.name === 'AuthSdkError') {
        // remove token from storage
        this.remove(key);
        err.tokenKey = key;
        this.emitError(err);
      }

      throw err;
    }).finally(() => {
      // Remove existing promise key
      this.state.renewPromise = null;
    });
    return this.state.renewPromise;
  }

  clear() {
    this.clearExpireEventTimeoutAll();
    this.storage.clearStorage();
  }

  getTokensFromStorageValue(value) {
    var tokens;

    try {
      tokens = JSON.parse(value) || {};
    } catch (e) {
      tokens = {};
    }

    return tokens;
  }

  updateRefreshToken(token) {
    var key = this.getStorageKeyByType('refreshToken') || REFRESH_TOKEN_STORAGE_KEY; // do not emit any event

    var tokenStorage = this.storage.getStorage();
    validateToken(token);
    tokenStorage[key] = token;
    this.storage.setStorage(tokenStorage);
  }

}
//# sourceMappingURL=TokenManager.js.map