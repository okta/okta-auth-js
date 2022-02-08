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

// BETA - SUBJECT TO CHANGE
// Currently we must modify request headers using the single instance of `idx.client.interceptors` exported from IDX-JS
// This means that multiple instances of OktaAuth will see the same header modifications
// TODO: use AuthJS http agent for IDX API requests. OKTA-417473
import { OktaAuth } from '../types';
import idx from './idx-js';

export function setGlobalRequestInterceptor(fn) {
  idx.client.interceptors.request.use(fn);
}

export function clearGlobalRequestInterceptor() {
  idx.client.interceptors.request.clear();
}

// A factory which returns a function that can be passed to `setGlobalRequestInterceptor`
export function createGlobalRequestInterceptor(sdk: OktaAuth) {
  return function (requestConfig) {
    // Set user-agent and any other custom headers set in the options
    var oktaUserAgentHeader = sdk._oktaUserAgent.getHttpHeader();
    const headers = Object.assign({
      ...oktaUserAgentHeader
    }, sdk.options.headers);
    Object.keys(headers).forEach(name => {
      // X-Device-Token may only be specified if the /interact request includes a `client_secret`
      // which indicates a trusted client which is allowed to present this information on behalf of the end user. 
      // https://oktainc.atlassian.net/browse/OKTA-441021
      if (!sdk.options.clientSecret && name === 'X-Device-Token') {
        return;
      }
      requestConfig.headers[name] = headers[name];
    });
  };
}
