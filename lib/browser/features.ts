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

const isWindowsPhone = /windows phone|iemobile|wpdesktop/i;	

export function getUserAgent() {
  return navigator.userAgent;
}

export function isFingerprintSupported() {
  const agent = getUserAgent();
  return agent && !isWindowsPhone.test(agent);	
}

export function isPopupPostMessageSupported() {
  var isIE8or9 = document.documentMode && document.documentMode < 10;
  if (window.postMessage && !isIE8or9) {
    return true;
  }
  return false;
}

export function isTokenVerifySupported() {
  return typeof crypto !== 'undefined' && crypto.subtle && typeof Uint8Array !== 'undefined';
}

export function hasTextEncoder() {
  return typeof TextEncoder !== 'undefined';
}

export function isPKCESupported() {
  return isTokenVerifySupported() && hasTextEncoder();
}

export function isHTTPS() {
  return window.location.protocol === 'https:';
}

export function isLocalhost() {
  return window.location.hostname === 'localhost';
}

