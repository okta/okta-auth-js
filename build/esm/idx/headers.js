import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import idx from '@okta/okta-idx-js';
export function setGlobalRequestInterceptor(fn) {
  idx.client.interceptors.request.use(fn);
} // A factory which returns a function that can be passed to `setGlobalRequestInterceptor`

export function createGlobalRequestInterceptor(sdk) {
  return function (requestConfig) {
    // Set user-agent and any other custom headers set in the options
    var oktaUserAgentHeader = sdk._oktaUserAgent.getHttpHeader();

    var headers = Object.assign(_objectSpread({}, oktaUserAgentHeader), sdk.options.headers);
    Object.keys(headers).forEach(name => {
      requestConfig.headers[name] = headers[name];
    });
  };
}
//# sourceMappingURL=headers.js.map