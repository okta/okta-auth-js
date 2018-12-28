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
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');

function fetchRequest(method, url, args) {
  var f = fetch(url, {
    method: method,
    headers: args.headers,
    body: JSON.stringify(args.data),
    credentials: 'include'
  })
  .then(function(response) {
    return response.json();
  });
  return f;
}

module.exports = fetchRequest;
