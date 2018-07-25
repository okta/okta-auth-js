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
var storageUtil = require('./storageUtil');
var Q = require('q');
var Emitter = require('tiny-emitter');
var config = require('./config');
var storageBuilder = require('./storageBuilder');

function emitExpired(tokenMgmtRef, key, token) {
  tokenMgmtRef.emitter.emit('expired', key, token);
}

function emitError(tokenMgmtRef, error) {
  tokenMgmtRef.emitter.emit('error', error);
}

function clearExpireEventTimeout(tokenMgmtRef, key) {
  clearTimeout(tokenMgmtRef.expireTimeouts[key]);
  delete tokenMgmtRef.expireTimeouts[key];
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

function setExpireEventTimeout(tokenMgmtRef, key, token) {
  var expireEventWait = (token.expiresAt * 1000) - Date.now();

  var expireEventTimeout = setTimeout(function() {
    emitExpired(tokenMgmtRef, key, token);
  }, expireEventWait);

  // Clear any existing timeout
  clearExpireEventTimeout(tokenMgmtRef, key);

  // Add a new timeout
  tokenMgmtRef.expireTimeouts[key] = expireEventTimeout;
}

function setExpireEventTimeoutAll(tokenMgmtRef, storage) {
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
    setExpireEventTimeout(tokenMgmtRef, key, token);
  }
}

function add(tokenMgmtRef, storage, key, token) {
  var tokenStorage = storage.getStorage();
  if (!util.isObject(token) ||
      !token.scopes ||
      (!token.expiresAt && token.expiresAt !== 0) ||
      (!token.idToken && !token.accessToken)) {
    throw new AuthSdkError('Token must be an Object with scopes, expiresAt, and an idToken or accessToken properties');
  }
  tokenStorage[key] = token;
  storage.setStorage(tokenStorage);
  setExpireEventTimeout(tokenMgmtRef, key, token);

  // Remove existing promise key
  delete tokenMgmtRef.refreshPromise[key];
}

function get(storage, key) {
  var tokenStorage = storage.getStorage();
  return tokenStorage[key];
}

function getAsync(sdk, tokenMgmtRef, storage, key) {
  var token = get(storage, key);
  if (!token || token.expiresAt * 1000 > Date.now()) {
    return Q.resolve(token);
  }

  return tokenMgmtRef.autoRefresh
    ? refresh(sdk, tokenMgmtRef, storage, key)
    : Q.resolve(remove(tokenMgmtRef, storage, key));
}

function remove(tokenMgmtRef, storage, key) {
  // Clear any listener for this token
  clearExpireEventTimeout(tokenMgmtRef, key);

  // Remove it from storage
  var tokenStorage = storage.getStorage();
  delete tokenStorage[key];
  storage.setStorage(tokenStorage);
}

function refresh(sdk, tokenMgmtRef, storage, key) {
  try {
    var token = get(storage, key);
    if (!token) {
      throw new AuthSdkError('The tokenManager has no token for the key: ' + key);
    }
  } catch (e) {
    return Q.reject(e);
  }

  // Remove existing autoRefresh timeout for this key
  clearExpireEventTimeout(tokenMgmtRef, key);

  // Store the refresh promise state, to avoid refreshing again
  if (!tokenMgmtRef.refreshPromise[key]) {
    tokenMgmtRef.refreshPromise[key] = sdk.token.refresh(token)
    .then(function(freshToken) {
      add(tokenMgmtRef, storage, key, freshToken);
      tokenMgmtRef.emitter.emit('refreshed', key, freshToken, token);

      return freshToken;
    })
    .fail(function(err) {
      if (err.name === 'OAuthError') {
        remove(tokenMgmtRef, storage, key);
        emitError(tokenMgmtRef, err);
      }

      throw err;
    });
  }
  return tokenMgmtRef.refreshPromise[key];
}

function clear(tokenMgmtRef, storage) {
  clearExpireEventTimeoutAll(tokenMgmtRef);
  storage.clearStorage();
}

function TokenManager(sdk, options) {
  options = options || {};
  options.storage = options.storage || 'localStorage';
  if (!options.autoRefresh && options.autoRefresh !== false) {
    options.autoRefresh = true;
  }

  if (options.storage === 'localStorage' && !storageUtil.browserHasLocalStorage()) {
    util.warn('This browser doesn\'t support localStorage. Switching to sessionStorage.');
    options.storage = 'sessionStorage';
  }

  if (options.storage === 'sessionStorage' && !storageUtil.browserHasSessionStorage()) {
    util.warn('This browser doesn\'t support sessionStorage. Switching to cookie-based storage.');
    options.storage = 'cookie';
  }

  var storage;
  switch(options.storage) {
    case 'localStorage':
      storage = storageBuilder(localStorage, config.TOKEN_STORAGE_NAME);
      break;
    case 'sessionStorage':
      storage = storageBuilder(sessionStorage, config.TOKEN_STORAGE_NAME);
      break;
    case 'cookie':
      storage = storageBuilder(storageUtil.getCookieStorage(), config.TOKEN_STORAGE_NAME);
      break;
    default:
      throw new AuthSdkError('Unrecognized storage option');
  }

  var tokenMgmtRef = {
    emitter: new Emitter(),
    autoRefresh: options.autoRefresh,
    expireTimeouts: {},
    refreshPromise: {}
  };

  this.add = util.bind(add, this, tokenMgmtRef, storage);
  this.get = util.bind(getAsync, this, sdk, tokenMgmtRef, storage);
  this.remove = util.bind(remove, this, tokenMgmtRef, storage);
  this.clear = util.bind(clear, this, tokenMgmtRef, storage);
  this.refresh = util.bind(refresh, this, sdk, tokenMgmtRef, storage);
  this.on = util.bind(tokenMgmtRef.emitter.on, tokenMgmtRef.emitter);
  this.off = util.bind(tokenMgmtRef.emitter.off, tokenMgmtRef.emitter);

  setExpireEventTimeoutAll(tokenMgmtRef, storage);
}

module.exports = TokenManager;
