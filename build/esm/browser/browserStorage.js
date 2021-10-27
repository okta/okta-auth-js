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
import AuthSdkError from '../errors/AuthSdkError';
import { warn } from '../util';

var Cookies = require('js-cookie'); // Building this as an object allows us to mock the functions in our tests


var storageUtil = {
  // These are shimmed in `OktaAuthBase.ts`
  getHttpCache() {
    return null;
  },

  getPKCEStorage() {
    return null;
  },

  // IE11 bug that Microsoft doesn't plan to fix
  // https://connect.microsoft.com/IE/Feedback/Details/1496040
  browserHasLocalStorage: function browserHasLocalStorage() {
    try {
      var storage = storageUtil.getLocalStorage();
      return storageUtil.testStorage(storage);
    } catch (e) {
      return false;
    }
  },
  browserHasSessionStorage: function browserHasSessionStorage() {
    try {
      var storage = storageUtil.getSessionStorage();
      return storageUtil.testStorage(storage);
    } catch (e) {
      return false;
    }
  },
  testStorageType: function testStorageType(storageType) {
    var supported = false;

    switch (storageType) {
      case 'sessionStorage':
        supported = storageUtil.browserHasSessionStorage();
        break;

      case 'localStorage':
        supported = storageUtil.browserHasLocalStorage();
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
  getStorageByType: function getStorageByType(storageType, options) {
    var storageProvider = null;

    switch (storageType) {
      case 'sessionStorage':
        storageProvider = storageUtil.getSessionStorage();
        break;

      case 'localStorage':
        storageProvider = storageUtil.getLocalStorage();
        break;

      case 'cookie':
        storageProvider = storageUtil.getCookieStorage(options);
        break;

      case 'memory':
        storageProvider = storageUtil.getInMemoryStorage();
        break;

      default:
        throw new AuthSdkError("Unrecognized storage option: ".concat(storageType));
        break;
    }

    return storageProvider;
  },
  findStorageType: function findStorageType(types) {
    var curType;
    var nextType;
    types = types.slice(); // copy array

    curType = types.shift();
    nextType = types.length ? types[0] : null;

    if (!nextType) {
      return curType;
    }

    if (storageUtil.testStorageType(curType)) {
      console.log('available storage:', curType);
      return curType;
    } // preferred type was unsupported.


    warn("This browser doesn't support ".concat(curType, ". Switching to ").concat(nextType, ".")); // fallback to the next type. this is a recursive call

    return storageUtil.findStorageType(types);
  },
  getLocalStorage: function getLocalStorage() {
    return localStorage;
  },
  getSessionStorage: function getSessionStorage() {
    return sessionStorage;
  },
  // Provides webStorage-like interface for cookies
  getCookieStorage: function getCookieStorage(options) {
    var secure = options.secure;
    var sameSite = options.sameSite;
    var sessionCookie = options.sessionCookie;

    if (typeof secure === 'undefined' || typeof sameSite === 'undefined') {
      throw new AuthSdkError('getCookieStorage: "secure" and "sameSite" options must be provided');
    }

    var storage = {
      getItem: storageUtil.storage.get,
      setItem: function setItem(key, value) {
        var expiresAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '2200-01-01T00:00:00.000Z';
        // By defauilt, cookie shouldn't expire
        expiresAt = sessionCookie ? null : expiresAt;
        storageUtil.storage.set(key, value, expiresAt, {
          secure: secure,
          sameSite: sameSite
        });
      },
      removeItem: function removeItem(key) {
        storageUtil.storage.delete(key);
      }
    };

    if (!options.useMultipleCookies) {
      return storage;
    } // options.useMultipleCookies - because cookies have size limits.
    // Can only be used when storing an object value. Object properties will be saved to separate cookies.
    //  Each property of the object must also be an object.


    return {
      getItem: function getItem(key) {
        var data = storage.getItem(); // read all cookies

        var value = {};
        Object.keys(data).forEach(k => {
          if (k.indexOf(key) === 0) {
            // filter out unrelated cookies
            value[k.replace("".concat(key, "_"), '')] = JSON.parse(data[k]); // populate with cookie dataa
          }
        });
        return JSON.stringify(value);
      },
      setItem: function setItem(key, value) {
        var existingValues = JSON.parse(this.getItem(key));
        value = JSON.parse(value); // Set key-value pairs from input to cookies

        Object.keys(value).forEach(k => {
          var storageKey = key + '_' + k;
          var valueToStore = JSON.stringify(value[k]);
          storage.setItem(storageKey, valueToStore);
          delete existingValues[k];
        }); // Delete unmatched keys from existing cookies

        Object.keys(existingValues).forEach(k => {
          storage.removeItem(key + '_' + k);
        });
      },
      removeItem: function removeItem(key) {
        var existingValues = JSON.parse(this.getItem(key));
        Object.keys(existingValues).forEach(k => {
          storage.removeItem(key + '_' + k);
        });
      }
    };
  },
  // Provides an in-memory solution
  inMemoryStore: {},
  getInMemoryStorage: function getInMemoryStorage() {
    return {
      getItem: key => {
        return this.inMemoryStore[key];
      },
      setItem: (key, value) => {
        this.inMemoryStore[key] = value;
      }
    };
  },
  testStorage: function testStorage(storage) {
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
    set: function set(name, value, expiresAt, options) {
      var {
        sameSite,
        secure
      } = options;

      if (typeof secure === 'undefined' || typeof sameSite === 'undefined') {
        throw new AuthSdkError('storage.set: "secure" and "sameSite" options must be provided');
      }

      var cookieOptions = {
        path: options.path || '/',
        secure,
        sameSite
      }; // eslint-disable-next-line no-extra-boolean-cast

      if (!!Date.parse(expiresAt)) {
        // Expires value can be converted to a Date object.
        //
        // If the 'expiresAt' value is not provided, or the value cannot be
        // parsed as a Date object, the cookie will set as a session cookie.
        cookieOptions.expires = new Date(expiresAt);
      }

      Cookies.set(name, value, cookieOptions);
      return storageUtil.storage.get(name);
    },
    get: function get(name) {
      return Cookies.get(name);
    },
    delete: function _delete(name) {
      return Cookies.remove(name, {
        path: '/'
      });
    }
  }
};
export default storageUtil;
//# sourceMappingURL=browserStorage.js.map