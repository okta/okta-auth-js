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


function readData(response) {
  if (response.headers.get('Content-Type') &&
    response.headers.get('Content-Type').toLowerCase().indexOf('application/json') >= 0) {
  return response.json()
    // JSON parse can fail if response is not a valid object
    .catch(e => {
      return {
        error: e,
        errorSummary: 'Could not parse server response'
      };
    });
  } else {
    return response.text();
  }
}

function formatResult(status, data) {
  const isObject = typeof data === 'object'; 
  const result = {
    responseText: isObject ? JSON.stringify(data) : data,
    status: status
  };
  if (isObject) {
    result.responseType = 'json';
    result.responseJSON = data;
  }
  return result;
}

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
    credentials: args.withCredentials ? 'include' : 'omit'
  })
  .then(function(response) {
    var error = !response.ok;
    var status = response.status;
    return readData(response)
      .then(data => {
        return formatResult(status, data);
      })
      .then(result => {
        if (error) {
          // Throwing result object since error handling is done in http.js
          throw result;
        }
        return result;
      });
  });
  return fetchPromise;
}

module.exports = fetchRequest;
