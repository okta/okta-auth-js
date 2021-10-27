"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.default = void 0;

var _crossFetch = _interopRequireDefault(require("cross-fetch"));

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
function readData(response) {
  if (response.headers.get('Content-Type') && response.headers.get('Content-Type').toLowerCase().indexOf('application/json') >= 0) {
    return response.json() // JSON parse can fail if response is not a valid object
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

function formatResult(status, data, response) {
  const isObject = typeof data === 'object';
  const headers = {};

  for (const pair of response.headers.entries()) {
    headers[pair[0]] = pair[1];
  }

  const result = {
    responseText: isObject ? JSON.stringify(data) : data,
    status: status,
    headers
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
  var contentType = headers['Content-Type'] || headers['content-type'] || ''; // JSON encode body (if appropriate)

  if (contentType === 'application/json' && body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  var fetch = global.fetch || _crossFetch.default;
  var fetchPromise = fetch(url, {
    method: method,
    headers: args.headers,
    body: body,
    credentials: args.withCredentials ? 'include' : 'omit'
  });

  if (!fetchPromise.finally) {
    fetchPromise = Promise.resolve(fetchPromise);
  }

  return fetchPromise.then(function (response) {
    var error = !response.ok;
    var status = response.status;
    return readData(response).then(data => {
      return formatResult(status, data, response);
    }).then(result => {
      var _result$responseJSON;

      if (error || (_result$responseJSON = result.responseJSON) !== null && _result$responseJSON !== void 0 && _result$responseJSON.error) {
        // Throwing result object since error handling is done in http.js
        throw result;
      }

      return result;
    });
  });
}

var _default = fetchRequest;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=fetchRequest.js.map