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

import { Cookies, CookieOptions } from './Cookies';

export interface StorageProvider {
  setStorage(obj: any): void;
  getStorage(): any;
  clearStorage(key?: string): void;
  updateStorage(key: string, value: any): void;
}

export interface PKCEMeta {
  codeVerifier: string;
  redirectUri: string;
}

export interface PKCEStorage extends StorageProvider {
  setStorage(obj: PKCEMeta): void;
  getStorage(): PKCEMeta;
}

export interface StorageOptions extends CookieOptions {
  preferLocalStorage?: boolean;
}

export interface StorageUtil {
  browserHasLocalStorage(): boolean;
  browserHasSessionStorage(): boolean;
  getLocalStorage(): Storage;
  getSessionStorage(): Storage;
  getInMemoryStorage(): SimpleStorage;
  getHttpCache(options?: StorageOptions): StorageProvider;
  getCookieStorage(options?: StorageOptions): CookieStorage;
  getPKCEStorage(options?: StorageOptions): PKCEStorage;
  testStorage(storage: any): boolean;
  storage: Cookies;
}

export interface SimpleStorage {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
}

export interface CookieStorage extends SimpleStorage {
  getItem(key?: string): any; // if no key is passed, all cookies are returned
}

// type StorageBuilder = (storage: Storage | SimpleStorage, name: string) => StorageProvider;