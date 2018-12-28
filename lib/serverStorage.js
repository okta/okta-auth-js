/*!
 * Copyright (c) 2018-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
var Storage = require('node-cache');

function set(name, value, expiresAt) {
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!(Date.parse(expiresAt))) {
    // Time to expiration in seconds
    var ttl = (Date.parse(expiresAt) - Date.now()) / 1000;
    Storage.set(name, value, ttl);
  } else {
    Storage.set(name, value);
  }

  return get(name);
}

function get(name) {
  return Storage.get(name);
}

function del(name) {
  return Storage.del(name);
}

module.exports = {
  set: set,
  get: get,
  delete: del
};
