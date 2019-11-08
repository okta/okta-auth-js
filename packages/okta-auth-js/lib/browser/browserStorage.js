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

var Cookies = require('js-cookie');
var storageBuilder = require('../storageBuilder');
var constants = require('../constants');

// Building this as an object allows us to mock the functions in our tests
var storageUtil = {};

// IE11 bug that Microsoft doesn't plan to fix
// https://connect.microsoft.com/IE/Feedback/Details/1496040
storageUtil.browserHasLocalStorage = function() {
  try {
    var storage = storageUtil.getLocalStorage();
    return storageUtil.testStorage(storage);
  } catch (e) {
    return false;
  }
};

storageUtil.browserHasSessionStorage = function() {
  try {
    var storage = storageUtil.getSessionStorage();
    return storageUtil.testStorage(storage);
  } catch (e) {
    return false;
  }
};

storageUtil.getPKCEStorage = function() {
  if (storageUtil.browserHasLocalStorage()) {
    return storageBuilder(storageUtil.getLocalStorage(), constants.PKCE_STORAGE_NAME);
  } else if (storageUtil.browserHasSessionStorage()) {
    return storageBuilder(storageUtil.getSessionStorage(), constants.PKCE_STORAGE_NAME);
  } else {
    return storageBuilder(storageUtil.getCookieStorage(), constants.PKCE_STORAGE_NAME);
  }
};

storageUtil.getHttpCache = function() {
  if (storageUtil.browserHasLocalStorage()) {
    return storageBuilder(storageUtil.getLocalStorage(), constants.CACHE_STORAGE_NAME);
  } else if (storageUtil.browserHasSessionStorage()) {
    return storageBuilder(storageUtil.getSessionStorage(), constants.CACHE_STORAGE_NAME);
  } else {
    return storageBuilder(storageUtil.getCookieStorage(), constants.CACHE_STORAGE_NAME);
  }
};

storageUtil.getLocalStorage = function() {
  return localStorage;
};

storageUtil.getSessionStorage = function() {
  return sessionStorage;
};

// Provides webStorage-like interface for cookies
storageUtil.getCookieStorage = function(options) {
  options = options || {};
  return {
    getItem: storageUtil.storage.get,
    setItem: function(key, value) {
      // Cookie shouldn't expire
      storageUtil.storage.set(key, value, '2200-01-01T00:00:00.000Z', options.secure);
    }
  };
};

// Provides an in-memory solution
storageUtil.getInMemoryStorage = function() {
  var store = {};
  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value;
    }
  };
};

storageUtil.testStorage = function(storage) {
  var key = 'okta-test-storage';
  try {
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
};

storageUtil.storage = {
  set: function(name, value, expiresAt, secure) {
    var cookieOptions = {
      path: '/',
      secure: secure
    };

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!(Date.parse(expiresAt))) {
      // Expires value can be converted to a Date object.
      //
      // If the 'expiresAt' value is not provided, or the value cannot be
      // parsed as a Date object, the cookie will set as a session cookie.
      cookieOptions.expires = new Date(expiresAt);
    }

    Cookies.set(name, value, cookieOptions);
    return storageUtil.storage.get(name);
  },

  get: function(name) {
    return Cookies.get(name);
  },

  delete: function(name) {
    return Cookies.remove(name, { path: '/' });
  }
};

module.exports = storageUtil;
