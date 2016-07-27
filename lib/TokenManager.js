var util = require('./util');
var AuthSdkError = require('./errors/AuthSdkError');
var cookies = require('./cookies');
var tokenStorageBuilder = require('./tokenStorageBuilder');
var Q = require('q');

// Provides webStorage-like interface for cookies
var cookieStorage = {
  getItem: cookies.getCookie,
  setItem: function(key, value) {
    // Cookie shouldn't expire
    cookies.setCookie(key, value, '2038-01-19T03:14:07.000Z');
  }
};

function add(storage, key, token) {
  var tokenStorage = storage.getTokenStorage();
  if (!util.isObject(token) ||
      !token.scopes ||
      (!token.expiresAt && token.expiresAt !== 0) ||
      (!token.idToken && !token.accessToken)) {
    throw new AuthSdkError('Token must be an Object with scopes, expiresAt, and an idToken or accessToken properties');
  }
  tokenStorage[key] = token;
  storage.setTokenStorage(tokenStorage);
}

function get(storage, key) {
  var tokenStorage = storage.getTokenStorage();
  return tokenStorage[key];
}

function remove(storage, key) {
  var tokenStorage = storage.getTokenStorage();
  delete tokenStorage[key];
  storage.setTokenStorage(tokenStorage);
}

function refresh(sdk, storage, key) {
  try {
    var token = get(storage, key);
    if (!token) {
      throw new AuthSdkError('The tokenManager has no token for the key: ' + key);
    }
  } catch (e) {
    return Q.reject(e);
  }

  var responseType;
  if (token.accessToken) {
    responseType = 'token';
  } else {
    responseType = 'id_token';
  }

  return sdk.token.getWithoutPrompt({
    responseType: responseType,
    scopes: token.scopes
  })
  .then(function(freshToken) {
    add(storage, key, freshToken);
    return freshToken;
  })
  .fail(function(err) {
    if (err.name === 'OAuthError') {
      remove(storage, key);
    }
    throw err;
  });
}

function TokenManager(sdk, options) {
  options = options || {};
  options.storage = options.storage || 'localStorage';

  var storage;
  switch(options.storage) {
    case 'localStorage':
      storage = tokenStorageBuilder(localStorage);
      break;
    case 'sessionStorage':
      storage = tokenStorageBuilder(sessionStorage);
      break;
    case 'cookie':
      storage = tokenStorageBuilder(cookieStorage);
      break;
    default:
      throw new AuthSdkError('Unrecognized storage option');
  }

  this.add = util.bind(add, this, storage);
  this.get = util.bind(get, this, storage);
  this.remove = util.bind(remove, this, storage);
  this.refresh = util.bind(refresh, this, sdk, storage);
}

module.exports = TokenManager;
