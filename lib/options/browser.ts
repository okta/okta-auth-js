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

/* eslint-disable complexity */
import { StorageManagerOptions, OktaAuthOptions, StorageUtil } from '../types';
import { warn } from '../util';

import { default as browserStorage } from '../browser/browserStorage';

export function getStorage(): StorageUtil {
  const storageUtil = Object.assign({}, browserStorage, {
    inMemoryStore: {} // create unique storage for this instance
  });
  return storageUtil;
}

export const STORAGE_MANAGER_OPTIONS: StorageManagerOptions = {
  token: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
  },
  cache: {
    storageTypes: [
      'localStorage',
      'sessionStorage',
      'cookie'
    ]
  },
  transaction: {
    storageTypes: [
      'sessionStorage',
      'localStorage',
      'cookie'
    ]
  },
  'shared-transaction': {
    storageTypes: [
      'localStorage'
    ]
  },
  'original-uri': {
    storageTypes: [
      'localStorage'
    ]
  }
};

export const enableSharedStorage = true;

export function getCookieSettings(args: OktaAuthOptions = {}, isHTTPS: boolean) {
  // Secure cookies will be automatically used on a HTTPS connection
  // Non-secure cookies will be automatically used on a HTTP connection
  // secure option can override the automatic behavior
  var cookieSettings = args.cookies || {};
  if (typeof cookieSettings.secure === 'undefined') {
    cookieSettings.secure = isHTTPS;
  }
  if (typeof cookieSettings.sameSite === 'undefined') {
    cookieSettings.sameSite = cookieSettings.secure ? 'none' : 'lax';
  }

  // If secure=true, but the connection is not HTTPS, set secure=false.
  if (cookieSettings.secure && !isHTTPS) {
    // eslint-disable-next-line no-console
    warn(
      'The current page is not being served with the HTTPS protocol.\n' +
      'For security reasons, we strongly recommend using HTTPS.\n' +
      'If you cannot use HTTPS, set "cookies.secure" option to false.'
    );
    cookieSettings.secure = false;
  }

  // Chrome >= 80 will block cookies with SameSite=None unless they are also Secure
  // If sameSite=none, but the connection is not HTTPS, set sameSite=lax.
  if (cookieSettings.sameSite === 'none' && !cookieSettings.secure) {
    cookieSettings.sameSite = 'lax';
  }

  return cookieSettings;
}
