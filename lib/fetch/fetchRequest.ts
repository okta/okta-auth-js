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

import crossFetch from 'cross-fetch';
import { FetchOptions, HttpResponse } from '../http/types';

// content-type = application/json OR application/ion+json
const appJsonContentTypeRegex = /application\/\w*\+?json/;

function readData(response: Response): Promise<object | string> {
  if (response.headers.get('Content-Type') &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    response.headers.get('Content-Type')!.toLowerCase().indexOf('application/json') >= 0) {
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

function formatResult(status: number, data: object | string, response: Response) {
  const isObject = typeof data === 'object';
  const headers = {};
  for (const pair of (response.headers as any).entries()) {
    headers[pair[0]] = pair[1];
  }
  const result: HttpResponse = {
    responseText: isObject ? JSON.stringify(data) : data as string,
    status: status,
    headers
  };
  if (isObject) {
    result.responseType = 'json';
    result.responseJSON = data as object;
  }
  return result;
}

/* eslint-disable complexity */
function fetchRequest(method: string, url: string, args: FetchOptions) {
  var body = args.data;
  var headers = args.headers || {};
  var contentType = (headers['Content-Type'] || headers['content-type'] || '');

  if (body && typeof body !== 'string') {
    // JSON encode body (if appropriate)
    if (appJsonContentTypeRegex.test(contentType)) {
      body = JSON.stringify(body);
    }
    else if (contentType === 'application/x-www-form-urlencoded') {
      body = Object.entries(body)
      .map( ([param, value]) => `${param}=${encodeURIComponent(value)}` )
      .join('&');
    }
  }

  var fetch = global.fetch || crossFetch;
  var fetchPromise = fetch(url, {
    method: method,
    headers: args.headers,
    body: body as string,
    credentials: args.withCredentials ? 'include' : 'omit'
  });

  if (!fetchPromise.finally) {
    fetchPromise = Promise.resolve(fetchPromise);
  }

  return fetchPromise.then(function(response) {
    var error = !response.ok;
    var status = response.status;
    return readData(response)
      .then(data => {
        return formatResult(status, data, response);
      })
      .then(result => {
        if (error || result.responseJSON?.error) {
          // Throwing result object since error handling is done in http.js
          throw result;
        }
        return result;
      });
  });
}

export default fetchRequest;
