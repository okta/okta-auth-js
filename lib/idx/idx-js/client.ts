/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// @ts-nocheck
import fetch from 'cross-fetch';

/**
 * Reusable interceptor interface
 */
export class Interceptor {
  handlers = [];

  // Adds a new interceptor to our HttpClient
  use(before) {
    this.handlers.push({
      before,
    });
  }

  // Clears all interceptors
  clear() {
    this.handlers = [];
  }
}

/**
 * Singleton instance of the IdX HTTP Client
 *
 * Invoke the `use` method to add a new interceptor:
 *   - client.interceptors.request.use((requestConfig) => { some logic });
 */
export const HttpClient = {
  interceptors: {
    request: new Interceptor(),
  },
};

export const request = async (
  target, 
  { 
    method = 'POST', 
    headers = {}, 
    credentials = 'include', 
    body 
  }
) => {
  const requestOptions = {
    url: target,
    method,
    headers: {
      ...headers,
    },
    credentials,
    body,
  };

  if (HttpClient.interceptors) {
    HttpClient.interceptors.request.handlers.forEach( interceptor => {
      interceptor.before(requestOptions);
    });
  }

  // Extract the URL to adhere to the fetch API
  const { url } = requestOptions;
  delete requestOptions.url;

  return fetch( url, requestOptions );
};
