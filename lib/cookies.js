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
  // The "expires" key with our cookie lib maps to "days until expired".
  // Since we expect it to expire on a specific point in time, we
  // subtract our current time to give us our "days until expired"
  var future = new Date(expiresAt).getTime();
  var now = new Date().getTime();

  // Convert time in ms into days
  // 1000 ms * 60 sec * 60 min * 24 hrs
  var expires = Math.floor((future - now)/(1000*60*60*24));

  Cookies.set(name, value, {
    expires: expires,
    path: '/'
  });
  return getCookie(name);
}

function getCookie(name) {
  return Cookies.get(name);
}

function deleteCookie(name) {
  Cookies.remove(name, { path: '/' });
}

module.exports = {
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie
};
