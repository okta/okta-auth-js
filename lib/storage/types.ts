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

import { OktaAuthBaseInterface, OktaAuthBaseOptions, OktaAuthOptionsConstructor } from '../base/types';

export interface CookieOptions {
  path?: string;
  secure?: boolean;
  sessionCookie?: boolean;
  sameSite?: string | boolean;
  expires?: Date;
}

export interface SetCookieOptions extends CookieOptions {
  path?: string;
}

export interface Cookies {
  set(name: string, value: string, expiresAt: string, options: SetCookieOptions): string;
  get(name: string): string;
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

export type StorageType = 'memory' | 'sessionStorage' | 'localStorage' | 'cookie' | 'custom' | 'auto';

export interface StorageOptions extends CookieOptions {
  storageType?: StorageType;
  storageTypes?: StorageType[];
  storageProvider?: SimpleStorage;
  storageKey?: string;
  useSeparateCookies?: boolean;
}

// for V1 authn interface: tx.resume()
export interface TxStorage {
  get(name: string): string | undefined;
  set(name: string, value: string, expiresAt: string, options: CookieOptions): string | undefined;
  delete(name: string): void;
}

export interface StorageUtil {
  storage: TxStorage;
  testStorageType(storageType: StorageType): boolean;
  getStorageByType(storageType: StorageType, options?: StorageOptions): SimpleStorage;
  findStorageType(types: StorageType[]): StorageType;
}

export interface StorageManagerOptions {
  token?: StorageOptions;
  transaction?: StorageOptions;
  [propName: string]: StorageOptions | undefined; // custom sections are allowed
}

export interface StorageManagerInterface {
  getHttpCache(options?: StorageOptions): StorageProvider
}

export interface StorageManagerConstructor<I extends StorageManagerInterface> {
  new(
    storageManagerOptions: StorageManagerOptions,
    cookieOptions: CookieOptions,
    storageUtil: StorageUtil
  ): I;
}

// options that can be passed to AuthJS
export interface OktaAuthStorageOptions extends OktaAuthBaseOptions {
  cookies?: CookieOptions;
  storageUtil?: StorageUtil;
  storageManager?: StorageManagerOptions;
}

// a class that constructs options
export type OktaAuthStorageOptionsConstructor = OktaAuthOptionsConstructor<OktaAuthStorageOptions>;

// an instance of AuthJS with storage capabilities
export interface OktaAuthStorageInterface
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthStorageOptions = OktaAuthStorageOptions
> 
  extends OktaAuthBaseInterface<O>
{
  storageManager: S;
  clearStorage(): void;
}
