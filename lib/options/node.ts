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

import { StorageManagerOptions, OktaAuthOptions, StorageUtil } from '../types';

import { default as storage } from '../server/serverStorage';

export function getStorage(): StorageUtil {
  return storage;
}

export const STORAGE_MANAGER_OPTIONS: StorageManagerOptions = {
  token: {
    storageTypes: [
      'memory'
    ]
  },
  cache: {
    storageTypes: [
      'memory'
    ]
  },
  transaction: {
    storageTypes: [
      'memory'
    ]
  }
};

export const enableSharedStorage = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function getCookieSettings(args: OktaAuthOptions = {}, isHTTPS?: boolean) {
  return args.cookies;
}
