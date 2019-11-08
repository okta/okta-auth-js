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

/* eslint complexity:[0,8] max-statements:[0,21] */
var util = require('./util');
var AuthSdkError = require('./errors/AuthSdkError');
var storageUtil = require('./browser/browserStorage');
var Q = require('q');
var Emitter = require('tiny-emitter');
var constants = require('./constants');
var storageBuilder = require('./storageBuilder');
var SdkClock = require('./clock');

var DEFAULT_OPTIONS = {
  autoRenew: true,
  storage: 'localStorage',
  expireEarlySeconds: 30
};

function getExpireTime(tokenMgmtRef, token) {
  var expireTime = token.expiresAt - tokenMgmtRef.options.expireEarlySeconds;
  return expireTime;
}

function hasExpired(tokenMgmtRef, token) {
  var expireTime = getExpireTime(tokenMgmtRef, token);
  return expireTime <= tokenMgmtRef.clock.now();
}

function emitExpired(tokenMgmtRef, key, token) {
  tokenMgmtRef.emitter.emit('expired', key, token);
}

function emitError(tokenMgmtRef, error) {
  tokenMgmtRef.emitter.emit('error', error);
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
    if (!expireTimeouts.hasOwnProperty(key)) {
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
    if (!tokenStorage.hasOwnProperty(key)) {
      continue;
    }
    var token = tokenStorage[key];
    setExpireEventTimeout(sdk, tokenMgmtRef, key, token);
  }
}

function add(sdk, tokenMgmtRef, storage, key, token) {
  var tokenStorage = storage.getStorage();
  if (!util.isObject(token) ||
      !token.scopes ||
      (!token.expiresAt && token.expiresAt !== 0) ||
      (!token.idToken && !token.accessToken)) {
    throw new AuthSdkError('Token must be an Object with scopes, expiresAt, and an idToken or accessToken properties');
  }
  tokenStorage[key] = token;
  storage.setStorage(tokenStorage);
  setExpireEventTimeout(sdk, tokenMgmtRef, key, token);
}

function get(storage, key) {
  var tokenStorage = storage.getStorage();
  return tokenStorage[key];
}

function getAsync(sdk, tokenMgmtRef, storage, key) {
  return Q.Promise(function(resolve) {
    var token = get(storage, key);
    if (!token || !hasExpired(tokenMgmtRef, token)) {
      return resolve(token);
    }

    var tokenPromise = tokenMgmtRef.options.autoRenew
      ? renew(sdk, tokenMgmtRef, storage, key)
      : remove(tokenMgmtRef, storage, key);

    return resolve(tokenPromise);
  });
}

function remove(tokenMgmtRef, storage, key) {
  // Clear any listener for this token
  clearExpireEventTimeout(tokenMgmtRef, key);

  // Remove it from storage
  var tokenStorage = storage.getStorage();
  delete tokenStorage[key];
  storage.setStorage(tokenStorage);
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
    return Q.reject(e);
  }

  // Remove existing autoRenew timeout for this key
  clearExpireEventTimeout(tokenMgmtRef, key);

  // Store the renew promise state, to avoid renewing again
  tokenMgmtRef.renewPromise[key] = sdk.token.renew(token)
    .then(function(freshTokens) {
      var freshToken = freshTokens;
      // With PKCE flow we will receive multiple tokens. Find the one we are looking for
      if (freshTokens instanceof Array) {
        freshToken = freshTokens.find(function(freshToken) {
          return (freshToken.idToken && token.idToken) || (freshToken.accessToken && token.accessToken);
        });
      }

      var oldToken = get(storage, key);
      if (!oldToken) {
        // It is possible to enter a state where the tokens have been cleared
        // after a renewal request was triggered. To ensure we do not store a
        // renewed token, we verify the promise key doesn't exist and return.
        return;
      }
      add(sdk, tokenMgmtRef, storage, key, freshToken);
      tokenMgmtRef.emitter.emit('renewed', key, freshToken, oldToken);
      return freshToken;
    })
    .catch(function(err) {
      if (err.name === 'OAuthError' || err.name === 'AuthSdkError') {
        remove(tokenMgmtRef, storage, key);
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

function TokenManager(sdk, options) {
  options = util.extend({}, DEFAULT_OPTIONS, util.removeNils(options));

  if (options.storage === 'localStorage' && !storageUtil.browserHasLocalStorage()) {
    util.warn('This browser doesn\'t support localStorage. Switching to sessionStorage.');
    options.storage = 'sessionStorage';
  }

  if (options.storage === 'sessionStorage' && !storageUtil.browserHasSessionStorage()) {
    util.warn('This browser doesn\'t support sessionStorage. Switching to cookie-based storage.');
    options.storage = 'cookie';
  }

  var storageProvider;
  if (typeof options.storage === 'object') {
    // A custom storage provider must implement getItem(key) and setItem(key, val)
    storageProvider = options.storage;
  } else {
    switch(options.storage) {
      case 'localStorage':
        storageProvider = localStorage;
        break;
      case 'sessionStorage':
        storageProvider = sessionStorage;
        break;
      case 'cookie':
        storageProvider = storageUtil.getCookieStorage(options);
        break;
      case 'memory':
        storageProvider = storageUtil.getInMemoryStorage();
        break;
      default:
        throw new AuthSdkError('Unrecognized storage option');
    }
  }
  var storageKey = options.storageKey || constants.TOKEN_STORAGE_NAME;
  var storage = storageBuilder(storageProvider, storageKey);
  var clock = SdkClock.create(sdk, options);
  var tokenMgmtRef = {
    clock: clock,
    options: options,
    emitter: new Emitter(),
    expireTimeouts: {},
    renewPromise: {}
  };

  this.add = util.bind(add, this, sdk, tokenMgmtRef, storage);
  this.get = util.bind(getAsync, this, sdk, tokenMgmtRef, storage);
  this.remove = util.bind(remove, this, tokenMgmtRef, storage);
  this.clear = util.bind(clear, this, tokenMgmtRef, storage);
  this.renew = util.bind(renew, this, sdk, tokenMgmtRef, storage);
  this.on = util.bind(tokenMgmtRef.emitter.on, tokenMgmtRef.emitter);
  this.off = util.bind(tokenMgmtRef.emitter.off, tokenMgmtRef.emitter);

  setExpireEventTimeoutAll(sdk, tokenMgmtRef, storage);
}

module.exports = TokenManager;
