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

import storageBuilder from '../storageBuilder';
import {
  PKCE_STORAGE_NAME,
  CACHE_STORAGE_NAME
} from '../constants';
import AuthSdkError from '../errors/AuthSdkError';
import { StorageUtil, StorageProvider, StorageOptions, PKCEStorage, CookieOptions } from '../types';

const Cookies = require('js-cookie');

// Building this as an object allows us to mock the functions in our tests
var storageUtil: StorageUtil = {

  // IE11 bug that Microsoft doesn't plan to fix
  // https://connect.microsoft.com/IE/Feedback/Details/1496040
  browserHasLocalStorage: function() {
    try {
      var storage = storageUtil.getLocalStorage();
      return storageUtil.testStorage(storage);
    } catch (e) {
      return false;
    }
  },

  browserHasSessionStorage: function() {
    try {
      var storage = storageUtil.getSessionStorage();
      return storageUtil.testStorage(storage);
    } catch (e) {
      return false;
    }
  },

  getPKCEStorage: function(options: StorageOptions): PKCEStorage {
    options = options || {};
    if (!options.preferLocalStorage && storageUtil.browserHasSessionStorage()) {
      return storageBuilder(storageUtil.getSessionStorage(), PKCE_STORAGE_NAME);
    } else if (storageUtil.browserHasLocalStorage()) {
      return storageBuilder(storageUtil.getLocalStorage(), PKCE_STORAGE_NAME);
    } else {
      return storageBuilder(storageUtil.getCookieStorage(options), PKCE_STORAGE_NAME);
    }
  },

  getHttpCache: function(options: StorageOptions): StorageProvider {
    if (storageUtil.browserHasLocalStorage()) {
      return storageBuilder(storageUtil.getLocalStorage(), CACHE_STORAGE_NAME);
    } else if (storageUtil.browserHasSessionStorage()) {
      return storageBuilder(storageUtil.getSessionStorage(), CACHE_STORAGE_NAME);
    } else {
      return storageBuilder(storageUtil.getCookieStorage(options), CACHE_STORAGE_NAME);
    }
  },

  getLocalStorage: function() {
    return localStorage;
  },

  getSessionStorage: function() {
    return sessionStorage;
  },

  // Provides webStorage-like interface for cookies
  getCookieStorage: function(options) {
    const secure = options.secure;
    const sameSite = options.sameSite;
    if (typeof secure === 'undefined' || typeof sameSite === 'undefined') {
      throw new AuthSdkError('getCookieStorage: "secure" and "sameSite" options must be provided');
    }
    return {
      getItem: storageUtil.storage.get,
      setItem: function(key, value) {
        // Cookie shouldn't expire
        storageUtil.storage.set(key, value, '2200-01-01T00:00:00.000Z', {
          secure: secure, 
          sameSite: sameSite
        });
      }
    };
  },

  // Provides an in-memory solution
  getInMemoryStorage: function() {
    var store = {};
    return {
      getItem: function(key) {
        return store[key];
      },
      setItem: function(key, value) {
        store[key] = value;
      }
    };
  },

  testStorage: function(storage) {
    var key = 'okta-test-storage';
    try {
      storage.setItem(key, key);
      storage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  storage: {
    set: function(name: string, value: string, expiresAt: string, options: CookieOptions): string {
      const secure = options.secure;
      const sameSite = options.sameSite;
      if (typeof secure === 'undefined' || typeof sameSite === 'undefined') {
        throw new AuthSdkError('storage.set: "secure" and "sameSite" options must be provided');
      }
      var cookieOptions: CookieOptions = {
        path: options.path || '/',
        secure,
        sameSite
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

    get: function(name: string): string {
      return Cookies.get(name);
    },

    delete: function(name) {
      return Cookies.remove(name, { path: '/' });
    }
  }
};

export default storageUtil;
