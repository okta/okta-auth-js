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

var fetch = require('cross-fetch');

/* eslint-disable complexity */
function fetchRequest(method, url, args) {
  var body = args.data;
  var headers = args.headers || {};
  var contentType = (headers['Content-Type'] || headers['content-type'] || '');

  // JSON encode body (if appropriate)
  if (contentType === 'application/json' && body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  var fetchPromise = fetch(url, {
    method: method,
    headers: args.headers,
    body: body,
    credentials: args.withCredentials === false ? 'omit' : 'include'
  })
  .then(function(response) {
    var error = !response.ok;
    var status = response.status;
    var respHandler = function(resp) {
      var result = {
        responseText: resp,
        status: status
      };
      if (error) {
        // Throwing response object since error handling is done in http.js
        throw result;
      }
      return result;
    };
    if (response.headers.get('Content-Type') &&
        response.headers.get('Content-Type').toLowerCase().indexOf('application/json') >= 0) {
      return response.json().then(respHandler);
    } else {
      return response.text().then(respHandler);
    }
  });
  return fetchPromise;
}

module.exports = fetchRequest;
