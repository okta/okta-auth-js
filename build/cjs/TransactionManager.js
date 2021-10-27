"use strict";

exports.default = void 0;

var _errors = require("./errors");

var _constants = require("./constants");

var _types = require("./types");

var _idxJs = require("./idx/types/idx-js");

var _util = require("./util");

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
class TransactionManager {
  constructor(options) {
    this.storageManager = options.storageManager;
    this.legacyWidgetSupport = options.legacyWidgetSupport === false ? false : true;
    this.saveNonceCookie = options.saveNonceCookie === false ? false : true;
    this.saveStateCookie = options.saveStateCookie === false ? false : true;
    this.saveParamsCookie = options.saveParamsCookie === false ? false : true;
    this.options = options;
  }

  clear(options = {}) {
    const transactionStorage = this.storageManager.getTransactionStorage();
    console.log('Clearing transaction meta: ', transactionStorage.getStorage());
    transactionStorage.clearStorage();
    const idxStateStorage = this.storageManager.getIdxResponseStorage();
    idxStateStorage === null || idxStateStorage === void 0 ? void 0 : idxStateStorage.clearStorage();

    if (!this.legacyWidgetSupport) {
      return;
    } // This is for compatibility with older versions of the signin widget. OKTA-304806


    if (options.oauth) {
      this.clearLegacyOAuthParams();
    }

    if (options.pkce) {
      this.clearLegacyPKCE();
    }
  } // eslint-disable-next-line complexity


  save(meta, options = {}) {
    // There must be only one transaction executing at a time.
    // Before saving, check to see if a transaction is already stored.
    // An existing transaction indicates a concurrency/race/overlap condition
    let storage = this.storageManager.getTransactionStorage();
    const obj = storage.getStorage();

    if ((0, _types.isTransactionMeta)(obj)) {
      // eslint-disable-next-line max-len
      (0, _util.warn)('a saved auth transaction exists in storage. This may indicate another auth flow is already in progress.');
    }

    console.log('Saving transaction meta: ', meta);
    storage.setStorage(meta);

    if (!options.oauth) {
      return;
    }

    if (this.saveNonceCookie || this.saveStateCookie || this.saveParamsCookie) {
      const cookieStorage = this.storageManager.getStorage({
        storageType: 'cookie'
      });

      if (this.saveParamsCookie) {
        const {
          responseType,
          state,
          nonce,
          scopes,
          clientId,
          urls,
          ignoreSignature
        } = meta;
        const oauthParams = {
          responseType,
          state,
          nonce,
          scopes,
          clientId,
          urls,
          ignoreSignature
        };
        cookieStorage.setItem(_constants.REDIRECT_OAUTH_PARAMS_NAME, JSON.stringify(oauthParams), null);
      }

      if (this.saveNonceCookie && meta.nonce) {
        // Set nonce cookie for servers to validate nonce in id_token
        cookieStorage.setItem(_constants.REDIRECT_NONCE_COOKIE_NAME, meta.nonce, null);
      }

      if (this.saveStateCookie && meta.state) {
        // Set state cookie for servers to validate state
        cookieStorage.setItem(_constants.REDIRECT_STATE_COOKIE_NAME, meta.state, null);
      }
    }
  }

  exists(options = {}) {
    try {
      const meta = this.load(options);
      return !!meta;
    } catch {
      return false;
    }
  } // load transaction meta from storage


  load(options = {}) {
    let storage = this.storageManager.getTransactionStorage();
    let meta = storage.getStorage();
    console.log('Loading transaction meta: ', meta);

    if ((0, _types.isTransactionMeta)(meta)) {
      // if we have meta in the new location, there is no need to go further
      return meta;
    }

    if (!this.legacyWidgetSupport) {
      return null;
    } // This is for compatibility with older versions of the signin widget. OKTA-304806


    if (options.oauth) {
      try {
        const oauthParams = this.loadLegacyOAuthParams();
        Object.assign(meta, oauthParams);
      } finally {
        this.clearLegacyOAuthParams();
      }
    }

    if (options.pkce) {
      try {
        const pkceMeta = this.loadLegacyPKCE();
        Object.assign(meta, pkceMeta);
      } finally {
        this.clearLegacyPKCE();
      }
    }

    if ((0, _types.isTransactionMeta)(meta)) {
      return meta;
    }

    return null;
  } // This is for compatibility with older versions of the signin widget. OKTA-304806


  clearLegacyPKCE() {
    // clear storages
    let storage;

    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({
        storageType: 'localStorage'
      });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({
        storageType: 'sessionStorage'
      });
      storage.clearStorage();
    }
  }

  loadLegacyPKCE() {
    let storage;
    let obj; // Try reading from localStorage first.

    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({
        storageType: 'localStorage'
      });
      obj = storage.getStorage();

      if (obj && obj.codeVerifier) {
        return obj;
      }
    } // If meta is not valid, read from sessionStorage. This is expected for more recent versions of the widget.


    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({
        storageType: 'sessionStorage'
      });
      obj = storage.getStorage();

      if (obj && obj.codeVerifier) {
        return obj;
      }
    } // If meta is not valid, throw an exception to avoid misleading server-side error
    // The most likely cause of this error is trying to handle a callback twice
    // eslint-disable-next-line max-len


    throw new _errors.AuthSdkError('Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.', null);
  }

  clearLegacyOAuthParams() {
    // clear storages
    let storage;

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({
        storageType: 'sessionStorage'
      });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({
        storageType: 'cookie'
      });
      storage.clearStorage();
    }
  }

  loadLegacyOAuthParams() {
    let storage;
    let oauthParams; // load first from session storage

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({
        storageType: 'sessionStorage'
      });
      oauthParams = storage.getStorage();
    }

    if ((0, _types.isOAuthTransactionMeta)(oauthParams)) {
      return oauthParams;
    } // try to load from cookie


    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({
        storageType: 'cookie'
      });
      oauthParams = storage.getStorage();
    }

    if ((0, _types.isOAuthTransactionMeta)(oauthParams)) {
      return oauthParams;
    }

    throw new _errors.AuthSdkError('Unable to retrieve OAuth redirect params from storage'); // Something is there but we don't recognize it
    // throw new AuthSdkError('Unable to parse the ' + REDIRECT_OAUTH_PARAMS_NAME + ' value from storage');
  }

  saveIdxResponse(idxResponse) {
    const storage = this.storageManager.getIdxResponseStorage();

    if (!storage) {
      return;
    }

    storage.setStorage(idxResponse);
  }

  loadIdxResponse() {
    const storage = this.storageManager.getIdxResponseStorage();

    if (!storage) {
      return null;
    }

    const idxResponse = storage.getStorage();

    if (!(0, _idxJs.isRawIdxResponse)(idxResponse)) {
      return null;
    }

    return idxResponse;
  }

}

exports.default = TransactionManager;
module.exports = exports.default;
//# sourceMappingURL=TransactionManager.js.map