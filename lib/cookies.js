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
  var expires = expiresAt || new Date('2038-01-19T03:14:07.000Z');

  if (typeof expires === 'string') {
    // Possible that the expiresAt value is passed via JSON
    expires = new Date(expires);
  }

  Cookies.set(name, value, {
    expires: expires,
    path: '/'
  });

  return getCookie(name);
}

function getCookie() {
  return Cookies.get.apply(Cookies, arguments);
}

function deleteCookie() {
  return Cookies.remove.apply(Cookies, arguments);
}

module.exports = {
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie
};
