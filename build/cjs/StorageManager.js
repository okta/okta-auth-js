"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.default = void 0;

var _constants = require("./constants");

var _SavedObject = _interopRequireDefault(require("./SavedObject"));

var _features = require("./features");

var _util = require("./util");

var _errors = require("./errors");

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
 */
function logServerSideMemoryStorageWarning(options) {
  if (!(0, _features.isBrowser)() && !options.storageProvider && !options.storageProvider) {
    // eslint-disable-next-line max-len
    (0, _util.warn)('Memory storage can only support simple single user use case on server side, please provide custom storageProvider or storageKey if advanced scenarios need to be supported.');
  }
}

class StorageManager {
  constructor(storageManagerOptions, cookieOptions, storageUtil) {
    this.storageManagerOptions = storageManagerOptions;
    this.cookieOptions = cookieOptions;
    this.storageUtil = storageUtil;
  } // combines defaults in order


  getOptionsForSection(sectionName, overrideOptions) {
    return Object.assign({}, this.storageManagerOptions[sectionName], overrideOptions);
  } // generic method to get any available storage provider


  getStorage(options) {
    options = Object.assign({}, this.cookieOptions, options); // set defaults

    if (options.storageProvider) {
      return options.storageProvider;
    }

    let {
      storageType,
      storageTypes
    } = options;

    if (storageType === 'sessionStorage') {
      options.sessionCookie = true;
    } // Maintain compatibility. Automatically fallback. May change in next major version. OKTA-362589


    if (storageType && storageTypes) {
      const idx = storageTypes.indexOf(storageType);

      if (idx >= 0) {
        storageTypes = storageTypes.slice(idx);
        storageType = null;
      }
    }

    if (!storageType) {
      storageType = this.storageUtil.findStorageType(storageTypes);
    }

    return this.storageUtil.getStorageByType(storageType, options);
  } // stateToken, interactionHandle


  getTransactionStorage(options) {
    options = this.getOptionsForSection('transaction', options);
    logServerSideMemoryStorageWarning(options);
    console.log("Selecting storage for 'transaction'");
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || _constants.TRANSACTION_STORAGE_NAME;
    return new _SavedObject.default(storage, storageKey);
  } // intermediate idxResponse
  // store for network traffic optimazation purpose
  // TODO: revisit in auth-js 6.0 epic JIRA: OKTA-399791


  getIdxResponseStorage(options) {
    let storage;

    if ((0, _features.isBrowser)()) {
      // on browser side only use memory storage 
      try {
        storage = this.storageUtil.getStorageByType('memory', options);
      } catch (e) {
        // it's ok to miss response storage
        // eslint-disable-next-line max-len
        (0, _util.warn)('No response storage found, you may want to provide custom implementation for intermediate idx responses to optimize the network traffic');
      }
    } else {
      // on server side re-use transaction custom storage
      const transactionStorage = this.getTransactionStorage(options);

      if (transactionStorage) {
        storage = {
          getItem: key => {
            const transaction = transactionStorage.getStorage();

            if (transaction && transaction[key]) {
              return transaction[key];
            }

            return null;
          },
          setItem: (key, val) => {
            const transaction = transactionStorage.getStorage();

            if (!transaction) {
              throw new _errors.AuthSdkError('Transaction has been cleared, failed to save idxState');
            }

            transaction[key] = val;
            transactionStorage.setStorage(transaction);
          },
          removeItem: key => {
            const transaction = transactionStorage.getStorage();

            if (!transaction) {
              return;
            }

            delete transaction[key];
            transactionStorage.setStorage(transaction);
          }
        };
      }
    }

    if (!storage) {
      return null;
    }

    return new _SavedObject.default(storage, _constants.IDX_RESPONSE_STORAGE_NAME);
  } // access_token, id_token, refresh_token


  getTokenStorage(options) {
    options = this.getOptionsForSection('token', options);
    logServerSideMemoryStorageWarning(options);
    console.log("Selecting storage for 'token'");
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || _constants.TOKEN_STORAGE_NAME;
    return new _SavedObject.default(storage, storageKey);
  } // caches well-known response, among others


  getHttpCache(options) {
    options = this.getOptionsForSection('cache', options);
    console.log("Selecting storage for 'cache'");
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || _constants.CACHE_STORAGE_NAME;
    return new _SavedObject.default(storage, storageKey);
  } // Will be removed in an upcoming major version. OKTA-362589


  getLegacyPKCEStorage(options) {
    options = this.getOptionsForSection('legacy-pkce', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || _constants.PKCE_STORAGE_NAME;
    return new _SavedObject.default(storage, storageKey);
  }

  getLegacyOAuthParamsStorage(options) {
    options = this.getOptionsForSection('legacy-oauth-params', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || _constants.REDIRECT_OAUTH_PARAMS_NAME;
    return new _SavedObject.default(storage, storageKey);
  }

}

exports.default = StorageManager;
module.exports = exports.default;
//# sourceMappingURL=StorageManager.js.map