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

/* eslint-disable node/no-unsupported-features/node-builtins */
/* global document, window, TextEncoder, navigator */

import { webcrypto } from './crypto';

const isWindowsPhone = /windows phone|iemobile|wpdesktop/i;	

export function isBrowser() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

export function isIE11OrLess() {
  return isBrowser() && !!document.documentMode && document.documentMode <= 11;
}

export function getUserAgent() {
  return navigator.userAgent;
}

export function isFingerprintSupported() {
  const agent = getUserAgent();
  return agent && !isWindowsPhone.test(agent);	
}

export function isPopupPostMessageSupported() {
  if (!isBrowser()) {
    return false;
  }
  var isIE8or9 = document.documentMode && document.documentMode < 10;
  if (window.postMessage && !isIE8or9) {
    return true;
  }
  return false;
}

export function isTokenVerifySupported() {
  return typeof webcrypto !== 'undefined'
    && webcrypto !== null
    && typeof webcrypto.subtle !== 'undefined'
    && typeof Uint8Array !== 'undefined';
}

export function hasTextEncoder() {
  return typeof TextEncoder !== 'undefined';
}

export function isPKCESupported() {
  return isTokenVerifySupported() && hasTextEncoder();
}

export function isHTTPS() {
  if (!isBrowser()) {
    return false;
  }
  return window.location.protocol === 'https:';
}

export function isLocalhost() {
  // eslint-disable-next-line compat/compat
  return isBrowser() && window.location.hostname === 'localhost';
}

