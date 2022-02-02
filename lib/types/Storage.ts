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

import { TransactionMeta } from './Transaction';
import { Cookies, CookieOptions } from './Cookies';
import { RawIdxResponse } from '../idx/types/idx-js';

// for V1 authn interface: tx.resume()
export interface TxStorage {
  get(name: string): string;
  set(name: string, value: string, expiresAt: string, options: CookieOptions): string;
  delete(name: string): string;
}

export interface SimpleStorage {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
  removeItem?: (key: string) => void;
}

export interface StorageProvider extends SimpleStorage {
  setStorage(obj: any): void;
  getStorage(): any;
  clearStorage(key?: string): void;
  updateStorage(key: string, value: any): void;
}

// will be removed in next version. OKTA-362589
export interface PKCEMeta {
  codeVerifier: string;
  redirectUri: string;
}

// will be removed in next version. OKTA-362589
export interface PKCEStorage extends StorageProvider {
  setStorage(obj: PKCEMeta): void;
  getStorage(): PKCEMeta;
}

export interface TransactionStorage extends StorageProvider {
  setStorage(obj: TransactionMeta): void;
  getStorage(): TransactionMeta;
}

export interface IdxResponseStorage extends StorageProvider {
  setStorage(obj: RawIdxResponse): void;
  getStorage(): RawIdxResponse;
}

export interface StorageOptions extends CookieOptions {
  storageType?: StorageType;
  storageTypes?: StorageType[];
  storageProvider?: SimpleStorage;
  storageKey?: string;
  useSeparateCookies?: boolean;
}

export type StorageType = 'memory' | 'sessionStorage' | 'localStorage' | 'cookie' | 'custom' | 'auto';

export interface StorageUtil {
  storage: TxStorage;
  testStorageType(storageType: StorageType): boolean;
  getStorageByType(storageType: StorageType, options?: StorageOptions): SimpleStorage;
  findStorageType(types: StorageType[]): StorageType;
}

export interface BrowserStorageUtil extends StorageUtil {
  browserHasLocalStorage(): boolean;
  browserHasSessionStorage(): boolean;
  getStorageByType(storageType: StorageType, options: StorageOptions): SimpleStorage;
  getLocalStorage(): Storage;
  getSessionStorage(): Storage;
  getInMemoryStorage(): SimpleStorage;
  getCookieStorage(options?: StorageOptions): CookieStorage;
  testStorage(storage: any): boolean;
  storage: Cookies;
  inMemoryStore: Record<string, unknown>;

  // will be removed in next version. OKTA-362589
  getHttpCache(options?: StorageOptions): StorageProvider;
  getPKCEStorage(options?: StorageOptions): PKCEStorage;
}

export interface NodeStorageUtil extends StorageUtil {
  // will be removed in next version. OKTA-362589
  getHttpCache(options?: StorageOptions): StorageProvider;
  getStorage(): SimpleStorage;
}

export interface CookieStorage extends SimpleStorage {
  setItem(key: string, value: any, expiresAt?: string | null): void; // can customize expiresAt
  getItem(key?: string): any; // if no key is passed, all cookies are returned
  removeItem(key: string); // remove a cookie
}

// type StorageBuilder = (storage: Storage | SimpleStorage, name: string) => StorageProvider;

export interface StorageManagerOptions {
  token?: StorageOptions;
  transaction?: StorageOptions;
  [propName: string]: StorageOptions | undefined; // custom sections are allowed
}
