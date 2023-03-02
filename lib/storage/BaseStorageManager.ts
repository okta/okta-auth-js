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



import {
  TOKEN_STORAGE_NAME,
  CACHE_STORAGE_NAME,
} from '../constants';
import {
  StorageUtil,
  StorageProvider,
  StorageOptions,
  CookieOptions,
  StorageManagerOptions,
  SimpleStorage,
  StorageManagerInterface
} from './types';
import { SavedObject } from './SavedObject';
import { isBrowser } from '../features';
import { warn } from '../util';

export function logServerSideMemoryStorageWarning(options: StorageOptions) {
  if (!isBrowser() && !options.storageProvider && !options.storageKey) {
    // eslint-disable-next-line max-len
    warn('Memory storage can only support simple single user use case on server side, please provide custom storageProvider or storageKey if advanced scenarios need to be supported.');
  }
}


export class BaseStorageManager implements StorageManagerInterface {
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
  // eslint-disable-next-line complexity
  getStorage(options: StorageOptions): SimpleStorage {
    options = Object.assign({}, this.cookieOptions, options); // set defaults

    if (options.storageProvider) {
      return options.storageProvider;
    }

    let { storageType, storageTypes } = options;

    if(storageType === 'sessionStorage') {
      options.sessionCookie = true;
    }

    // If both storageType and storageTypes are specified, then storageType will be used first
    // If storageType cannot be used but it matches an entry in storageTypes, subsequent entries may be used as fallback
    // if storageType does not match an entry in storageTypes then storageType is used with no fallback.
    if (storageType && storageTypes) {
      const idx = storageTypes.indexOf(storageType);
      if (idx >= 0) {
        storageTypes = storageTypes.slice(idx);
        storageType = undefined;
      }
    }

    if (!storageType) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      storageType = this.storageUtil.findStorageType(storageTypes!);
    }
    return this.storageUtil.getStorageByType(storageType, options);
  }

  // access_token, id_token, refresh_token
  getTokenStorage(options?: StorageOptions): StorageProvider {
    options = this.getOptionsForSection('token', options);
    logServerSideMemoryStorageWarning(options);
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

}
