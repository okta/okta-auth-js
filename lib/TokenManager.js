var util = require('./util');
var AuthSdkError = require('./errors/AuthSdkError');
var cookies = require('./cookies');
var tokenStorageBuilder = require('./tokenStorageBuilder');

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
  if (!util.isObject(token)) {
    throw new AuthSdkError('Token must be an Object');
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

function TokenManager(options) {
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
}

module.exports = TokenManager;
