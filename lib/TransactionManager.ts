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


import { AuthSdkError } from './errors';
import { REDIRECT_NONCE_COOKIE_NAME, REDIRECT_OAUTH_PARAMS_NAME, REDIRECT_STATE_COOKIE_NAME } from './constants';
import { StorageManager } from './StorageManager';
import {
  StorageProvider,
  TransactionMeta,
  isTransactionMeta,
  isOAuthTransactionMeta,
  PKCETransactionMeta,
  OAuthTransactionMeta,
  TransactionMetaOptions,
  TransactionManagerOptions,
  CookieStorage,
  SavedIdxResponse
} from './types';
import { isRawIdxResponse } from './idx/types/idx-js';
import { warn } from './util';
import {
  clearTransactionFromSharedStorage,
  loadTransactionFromSharedStorage,
  pruneSharedStorage,
  saveTransactionToSharedStorage
} from './util/sharedStorage';

export interface ClearTransactionMetaOptions extends TransactionMetaOptions {
  clearSharedStorage?: boolean;
}
export default class TransactionManager {
  options: TransactionManagerOptions;
  storageManager: StorageManager;
  legacyWidgetSupport: boolean;
  saveNonceCookie: boolean;
  saveStateCookie: boolean;
  saveParamsCookie: boolean;
  enableSharedStorage: boolean;
  saveLastResponse: boolean;

  constructor(options: TransactionManagerOptions) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.storageManager = options.storageManager!;
    this.legacyWidgetSupport = options.legacyWidgetSupport === false ? false : true;
    this.saveNonceCookie = options.saveNonceCookie === false ? false : true;
    this.saveStateCookie = options.saveStateCookie === false ? false : true;
    this.saveParamsCookie = options.saveParamsCookie === false ? false : true;
    this.enableSharedStorage = options.enableSharedStorage === false ? false : true;
    this.saveLastResponse = options.saveLastResponse === false ? false : true;
    this.options = options;
  }

  // eslint-disable-next-line complexity
  clear(options: ClearTransactionMetaOptions = {}) {
    const transactionStorage: StorageProvider = this.storageManager.getTransactionStorage();
    const meta = transactionStorage.getStorage();

    // Clear primary storage (by default, sessionStorage on browser)
    transactionStorage.clearStorage();

    // clear IDX response storage
    this.clearIdxResponse();

    // Usually we want to also clear shared storage unless another tab may need it to continue/complete a flow
    if (this.enableSharedStorage && options.clearSharedStorage !== false) {
      const state = options.state || meta?.state;
      if (state) {
        clearTransactionFromSharedStorage(this.storageManager, state);
      }
    }
  
    if (!this.legacyWidgetSupport) {
      return;
    }

    // This is for compatibility with older versions of the signin widget. OKTA-304806
    if (options.oauth) {
      this.clearLegacyOAuthParams();
    }

    if (options.pkce) {
      this.clearLegacyPKCE();
    }
  }

  // eslint-disable-next-line complexity
  save(meta: TransactionMeta, options: TransactionMetaOptions = {}) {
    // There must be only one transaction executing at a time.
    // Before saving, check to see if a transaction is already stored.
    // An existing transaction indicates a concurrency/race/overlap condition

    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    const obj = storage.getStorage();
    // oie process may need to update transaction in the middle of process for tracking purpose
    // false alarm might be caused 
    // TODO: revisit for a better solution, https://oktainc.atlassian.net/browse/OKTA-430919
    if (isTransactionMeta(obj) && !options.muteWarning) {
      // eslint-disable-next-line max-len
      warn('a saved auth transaction exists in storage. This may indicate another auth flow is already in progress.');
    }

    storage.setStorage(meta);

    // Shared storage allows continuation of transaction in another tab
    if (this.enableSharedStorage && meta.state) {
      saveTransactionToSharedStorage(this.storageManager, meta.state, meta);
    }

    if (!options.oauth) {
      return;
    }
  
    // Legacy cookie storage
    if (this.saveNonceCookie || this.saveStateCookie || this.saveParamsCookie) {
      const cookieStorage: CookieStorage = this.storageManager.getStorage({ storageType: 'cookie' }) as CookieStorage;

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
        cookieStorage.setItem(REDIRECT_OAUTH_PARAMS_NAME, JSON.stringify(oauthParams), null);
      }

      if (this.saveNonceCookie && meta.nonce) {
        // Set nonce cookie for servers to validate nonce in id_token
        cookieStorage.setItem(REDIRECT_NONCE_COOKIE_NAME, meta.nonce, null);
      }

      if (this.saveStateCookie && meta.state) {
        // Set state cookie for servers to validate state
        cookieStorage.setItem(REDIRECT_STATE_COOKIE_NAME, meta.state, null);
      }
    }
  }

  exists(options: TransactionMetaOptions = {}): boolean {
    try {
      const meta = this.load(options);
      return !!meta;
    } catch {
      return false;
    }
  }

  // load transaction meta from storage
  // eslint-disable-next-line complexity,max-statements
  load(options: TransactionMetaOptions = {}): TransactionMeta | null {

    let meta: TransactionMeta;

    // If state was passed, try loading transaction data from shared storage
    if (this.enableSharedStorage && options.state) {
      pruneSharedStorage(this.storageManager); // prune before load
      meta = loadTransactionFromSharedStorage(this.storageManager, options.state);
      if (isTransactionMeta(meta)) {
        return meta;
      }
    }

    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    meta = storage.getStorage();
    if (isTransactionMeta(meta)) {
      // if we have meta in the new location, there is no need to go further
      return meta;
    }

    if (!this.legacyWidgetSupport) {
      return null;
    }

    // This is for compatibility with older versions of the signin widget. OKTA-304806
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
        const pkceMeta: PKCETransactionMeta = this.loadLegacyPKCE();
        Object.assign(meta, pkceMeta);
      } finally {
        this.clearLegacyPKCE();
      }
    }

    if (isTransactionMeta(meta)) {
      return meta;
    }
    return null;
  }

  // This is for compatibility with older versions of the signin widget. OKTA-304806
  clearLegacyPKCE(): void {
    // clear storages
    let storage: StorageProvider;

    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
      storage.clearStorage();
    }
  }

  loadLegacyPKCE(): PKCETransactionMeta {
    let storage: StorageProvider;
    let obj;
    
    // Try reading from localStorage first.
    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
      obj = storage.getStorage();
      if (obj && obj.codeVerifier) {
        return obj;
      }
    }

    // If meta is not valid, read from sessionStorage. This is expected for more recent versions of the widget.
    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
      obj = storage.getStorage();
      if (obj && obj.codeVerifier) {
        return obj;
      }
    }
    
    // If meta is not valid, throw an exception to avoid misleading server-side error
    // The most likely cause of this error is trying to handle a callback twice
    // eslint-disable-next-line max-len
    throw new AuthSdkError('Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.', undefined);
  }

  clearLegacyOAuthParams(): void {
    // clear storages
    let storage: StorageProvider;

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'sessionStorage' });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'cookie' });
      storage.clearStorage();
    }
  }

  loadLegacyOAuthParams(): OAuthTransactionMeta {
    let storage: StorageProvider;
    let oauthParams;
  
    // load first from session storage
    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'sessionStorage' });
      oauthParams = storage.getStorage();
    }
    if (isOAuthTransactionMeta(oauthParams)) {
      return oauthParams;
    }

    // try to load from cookie
    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'cookie' });
      oauthParams = storage.getStorage();
    }

    if (isOAuthTransactionMeta(oauthParams)) {
      return oauthParams;
    }


    throw new AuthSdkError('Unable to retrieve OAuth redirect params from storage');

    // Something is there but we don't recognize it
    // throw new AuthSdkError('Unable to parse the ' + REDIRECT_OAUTH_PARAMS_NAME + ' value from storage');
  }

  saveIdxResponse({ rawIdxResponse, requestDidSucceed }: SavedIdxResponse): void {
    if (!this.saveLastResponse) {
      return;
    }
    const storage = this.storageManager.getIdxResponseStorage();
    if (!storage) {
      return;
    }
    storage.setStorage({ rawIdxResponse, requestDidSucceed });
  }

  loadIdxResponse(): SavedIdxResponse | null {
    if (!this.saveLastResponse) {
      return null;
    }
    const storage = this.storageManager.getIdxResponseStorage();
    if (!storage) {
      return null;
    }
    const idxResponse = storage.getStorage();
    if (!isRawIdxResponse(idxResponse)) {
      return null;
    }
    return idxResponse;
  }

  clearIdxResponse(): void {
    if (!this.saveLastResponse) {
      return;
    }
    const storage = this.storageManager.getIdxResponseStorage();
    storage?.clearStorage();
  }
}