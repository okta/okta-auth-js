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
 *
 */
var Cookies = require('js-cookie');

function setCookie(name, value, expiresAt) {
  var cookieOptions = {
    path: '/'
  };

  // eslint-disable-next-line no-extra-boolean-cast
  if (!!(Date.parse(expiresAt))) {
    // Expires value can be converted to a Date object.
    //
    // If the 'expiresAt' value is not provided, or the value cannot be
    // parsed as a Date object, the cookie will set as a session cookie.
    cookieOptions.expires = new Date(expiresAt);
  }

  Cookies.set(name, value, cookieOptions);
  return getCookie(name);
}

function getCookie(name) {
  return Cookies.get(name);
}

function deleteCookie(name) {
  return Cookies.remove(name, { path: '/' });
}

module.exports = {
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie
};
