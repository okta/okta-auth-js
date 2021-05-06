
import {
  PKCE_STORAGE_NAME,
  TOKEN_STORAGE_NAME,
  TRANSACTION_STORAGE_NAME,
  RESPONSE_STORAGE_NAME,
  CACHE_STORAGE_NAME,
  REDIRECT_OAUTH_PARAMS_NAME
} from './constants';
import {
  StorageUtil,
  StorageProvider,
  StorageOptions,
  PKCEStorage,
  CookieOptions,
  TransactionStorage,
  ResponseStorage,
  StorageManagerOptions,
  SimpleStorage
} from './types';
import SavedObject from './SavedObject';
import { isBrowser } from './features';
import { warn } from './util';

export default class StorageManager {
  storageManagerOptions: StorageManagerOptions;
  cookieOptions: CookieOptions;
  storageUtil: StorageUtil;

  constructor(storageManagerOptions: StorageManagerOptions, cookieOptions: CookieOptions, storageUtil: StorageUtil) {
    this.storageManagerOptions = storageManagerOptions;
    this.cookieOptions = cookieOptions;
    this.storageUtil = storageUtil;
  }

  // combines defaults in order
  getOptionsForSection(sectionName: string, overrideOptions?: StorageOptions) {
    return Object.assign({}, this.storageManagerOptions[sectionName], overrideOptions);
  }
 
  // generic method to get any available storage provider
  getStorage(options: StorageOptions): SimpleStorage {
    options = Object.assign({}, this.cookieOptions, options); // set defaults

    if (options.storageProvider) {
      return options.storageProvider;
    }

    let { storageType, storageTypes } = options;

    if(storageType === 'sessionStorage') {
      options.sessionCookie = true;
    }

    // Maintain compatibility. Automatically fallback. May change in next major version. OKTA-362589
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
  }

  // stateToken, interactionHandle
  getTransactionStorage(options?: StorageOptions): TransactionStorage {
    options = this.getOptionsForSection('transaction', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TRANSACTION_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // intermediate idxResponse
  // store for optimazation purpose
  getResponseStorage(options?: StorageOptions): ResponseStorage {
    options = this.getOptionsForSection('response', options);

    let storage;
    if (options.storageProvider) {
      storage = options.storageProvider;
    } else {
      const storageType = isBrowser() ? 'memory' : null;
      try {
        storage = this.storageUtil.getStorageByType(storageType, options);
      } catch (e) {
        // it's ok to miss response storage
        warn(
          'No response storage found, you may want to provide custom implementation to optimize the network traffic'
        );
      }
    }

    if (!storage) {
      return null;
    }

    const storageKey = options.storageKey || RESPONSE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // access_token, id_token, refresh_token
  getTokenStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('token', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || TOKEN_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // caches well-known response, among others
  getHttpCache(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('cache', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || CACHE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  // Will be removed in an upcoming major version. OKTA-362589
  getLegacyPKCEStorage(options?: StorageOptions): PKCEStorage {
    options = this.getOptionsForSection('legacy-pkce', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || PKCE_STORAGE_NAME;
    return new SavedObject(storage, storageKey);
  }

  getLegacyOAuthParamsStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('legacy-oauth-params', options);
    const storage = this.getStorage(options);
    const storageKey = options.storageKey || REDIRECT_OAUTH_PARAMS_NAME;
    return new SavedObject(storage, storageKey);
  }
}
