/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

import Cookies from 'js-cookie';
import AuthSdkError from '../errors/AuthSdkError';
import {
  StorageProvider,
  StorageOptions,
  PKCEStorage,
  CookieOptions,
  SimpleStorage,
  StorageType,
  BrowserStorageUtil,
  CookieStorage
} from '../types';
import { warn } from '../util';

// Building this as an object allows us to mock the functions in our tests
var storageUtil: BrowserStorageUtil = {

  // These are shimmed in `OktaAuthBase.ts`
  getHttpCache(): StorageProvider {
    return null as never as StorageProvider;
  },

  getPKCEStorage(): PKCEStorage {
    return null as never as PKCEStorage;
  },

  // IE11 bug that Microsoft doesn't plan to fix
  // https://connect.microsoft.com/IE/Feedback/Details/1496040
  browserHasLocalStorage: function() {
    try {
      var storage = this.getLocalStorage();
      return this.testStorage(storage);
    } catch (e) {
      return false;
    }
  },

  browserHasSessionStorage: function() {
    try {
      var storage = this.getSessionStorage();
      return this.testStorage(storage);
    } catch (e) {
      return false;
    }
  },

  testStorageType: function(storageType: StorageType): boolean {
    var supported = false;
    switch (storageType) {
      case 'sessionStorage':
        supported = this.browserHasSessionStorage();
        break;
      case 'localStorage':
        supported = this.browserHasLocalStorage();
        break;
      case 'cookie':
      case 'memory':
        supported = true;
        break;
      default:
        supported = false;
        break;
    }
    return supported;
  },

  getStorageByType: function(storageType: StorageType, options?: StorageOptions): SimpleStorage {
    let storageProvider;
    switch (storageType) {
      case 'sessionStorage':
        storageProvider = this.getSessionStorage();
        break;
      case 'localStorage':
        storageProvider = this.getLocalStorage();
        break;
      case 'cookie':
        storageProvider = this.getCookieStorage(options);
        break;
      case 'memory':
        storageProvider = this.getInMemoryStorage();
        break;
      default:
        throw new AuthSdkError(`Unrecognized storage option: ${storageType}`);
        break;
    }
    return storageProvider;
  },

  findStorageType: function(types: StorageType[]) {
    let curType;
    let nextType;
    
    types = types.slice(); // copy array
    curType = types.shift();
    nextType = types.length ? types[0] : null;
    if (!nextType) {
      return curType;
    }

    if (this.testStorageType(curType)) {
      return curType;
    }

    // preferred type was unsupported.
    warn(`This browser doesn't support ${curType}. Switching to ${nextType}.`);

    // fallback to the next type. this is a recursive call
    return this.findStorageType(types);
  },

  getLocalStorage: function() {
    return localStorage;
  },

  getSessionStorage: function() {
    return sessionStorage;
  },

  // Provides webStorage-like interface for cookies
  getCookieStorage: function(options): CookieStorage {
    const secure = options!.secure;
    const sameSite = options!.sameSite;
    const sessionCookie = options!.sessionCookie;
    if (typeof secure === 'undefined' || typeof sameSite === 'undefined') {
      throw new AuthSdkError('getCookieStorage: "secure" and "sameSite" options must be provided');
    }
    const storage: CookieStorage = {
      getItem: this.storage.get,
      setItem: (key, value, expiresAt = '2200-01-01T00:00:00.000Z') => {
        // By defauilt, cookie shouldn't expire
        expiresAt = (sessionCookie ? null : expiresAt) as string;
        this.storage.set(key, value, expiresAt, {
          secure: secure, 
          sameSite: sameSite,
        });
      },
      removeItem: (key) => {
        this.storage.delete(key);
      }
    };

    if (!options!.useSeparateCookies) {
      return storage;
    }

    // Tokens are stored separately because cookies have size limits.
    // Can only be used when storing an object value. Object properties will be saved to separate cookies.
    // Each property of the object must also be an object.
    return {
      getItem: function(key) {
        var data = storage.getItem(); // read all cookies
        var value = {};
        Object.keys(data).forEach(k => {
          if (k.indexOf(key!) === 0) { // filter out unrelated cookies
            value[k.replace(`${key}_`, '')] = JSON.parse(data[k]); // populate with cookie data
          }
        });
        return JSON.stringify(value);
      },
      setItem: function(key, value) {
        var existingValues = JSON.parse(this.getItem(key));
        value = JSON.parse(value);
        // Set key-value pairs from input to cookies
        Object.keys(value).forEach(k => {
          var storageKey = key + '_' + k;
          var valueToStore = JSON.stringify(value[k]);
          storage.setItem(storageKey, valueToStore);
          delete existingValues[k];
        });
        // Delete unmatched keys from existing cookies
        Object.keys(existingValues).forEach(k => {
          storage.removeItem(key + '_' + k);
        });
      },
      removeItem: function(key) {
        var existingValues = JSON.parse(this.getItem(key));
        Object.keys(existingValues).forEach(k => {
          storage.removeItem(key + '_' + k);
        });
      }
    };
  },

  // Provides an in-memory solution
  inMemoryStore: {}, // override this for a unique memory store per instance
  getInMemoryStorage: function() {
    return {
      getItem: (key) => {
        return this.inMemoryStore[key];
      },
      setItem: (key, value) => {
        this.inMemoryStore[key] = value;
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
      const { sameSite, secure } = options;
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
      return this.get(name);
    },

    get: function(name?: string): string {
      // return all cookies when no args is provided
      if (!arguments.length) {
        return Cookies.get();
      }
      return Cookies.get(name);
    },

    delete: function(name: string): string {
      return Cookies.remove(name, { path: '/' });
    }
  }
};

export default storageUtil;
