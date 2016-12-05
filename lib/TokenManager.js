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

function clearRefreshTimeout(tokenMgmtRef, key) {
  clearTimeout(tokenMgmtRef.refreshTimeouts[key]);
  delete tokenMgmtRef.refreshTimeouts[key];
}

function clearRefreshTimeoutAll(tokenMgmtRef) {
  var refreshTimeouts = tokenMgmtRef.refreshTimeouts;
  for(var key in refreshTimeouts) {
    if (!refreshTimeouts.hasOwnProperty(key)) {
      continue;
    }
    clearRefreshTimeout(tokenMgmtRef, key);
  }
  tokenMgmtRef.refreshTimeouts = {};
}

function setRefreshTimeout(sdk, tokenMgmtRef, storage, key, token) {
  var refreshWait = (token.expiresAt * 1000) - Date.now();
  if (refreshWait < 0) {
    // Already expired
    refreshWait = 0;
  }
  var refreshTimeout = setTimeout(function() {
    if (tokenMgmtRef.autoRefresh) {
      return refresh(sdk, tokenMgmtRef, storage, key);
    } else if (token.expiresAt * 1000 <= Date.now()) {
      remove(tokenMgmtRef, storage, key);
      emitExpired(tokenMgmtRef, key, token);
    }
  }, refreshWait);

  // Clear any existing timeout
  clearRefreshTimeout(tokenMgmtRef, key);

  // Add a new timeout
  tokenMgmtRef.refreshTimeouts[key] = refreshTimeout;
}

function setRefreshTimeoutAll(sdk, tokenMgmtRef, storage) {
  try {
    var tokenStorage = storage.getStorage();
  } catch(e) {
    // Any errors thrown on instantiation will not be caught,
    // because there are no listeners yet
    tokenMgmtRef.emitter.emit('error', e);
    return;
  }

  for(var key in tokenStorage) {
    if (!tokenStorage.hasOwnProperty(key)) {
      continue;
    }
    var token = tokenStorage[key];
    setRefreshTimeout(sdk, tokenMgmtRef, storage, key, token);
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
  setRefreshTimeout(sdk, tokenMgmtRef, storage, key, token);
}

function get(storage, key) {
  var tokenStorage = storage.getStorage();
  return tokenStorage[key];
}

function remove(tokenMgmtRef, storage, key) {
  // Clear any listener for this token
  clearRefreshTimeout(tokenMgmtRef, key);

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
  clearRefreshTimeout(tokenMgmtRef, key);

  return sdk.token.refresh(token)
  .then(function(freshToken) {
    add(sdk, tokenMgmtRef, storage, key, freshToken);
    tokenMgmtRef.emitter.emit('refreshed', key, freshToken, token);
    return freshToken;
  })
  .fail(function(err) {
    if (err.name === 'OAuthError') {
      remove(tokenMgmtRef, storage, key);
      emitExpired(tokenMgmtRef, key, token);
    }
    throw err;
  });
}

function clear(tokenMgmtRef, storage) {
  clearRefreshTimeoutAll(tokenMgmtRef);
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
    refreshTimeouts: {}
  };

  this.add = util.bind(add, this, sdk, tokenMgmtRef, storage);
  this.get = util.bind(get, this, storage);
  this.remove = util.bind(remove, this, tokenMgmtRef, storage);
  this.clear = util.bind(clear, this, tokenMgmtRef, storage);
  this.refresh = util.bind(refresh, this, sdk, tokenMgmtRef, storage);
  this.on = util.bind(tokenMgmtRef.emitter.on, tokenMgmtRef.emitter);
  this.off = util.bind(tokenMgmtRef.emitter.off, tokenMgmtRef.emitter);
  
  setRefreshTimeoutAll(sdk, tokenMgmtRef, storage);
}

module.exports = TokenManager;
