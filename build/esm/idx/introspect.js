import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import idx from '@okta/okta-idx-js';
import { getOAuthDomain } from '../oidc';
import { IDX_API_VERSION } from '../constants';
export function introspect(_x, _x2) {
  return _introspect.apply(this, arguments);
}

function _introspect() {
  _introspect = _asyncToGenerator(function* (authClient, options) {
    var rawIdxResponse; // try load from storage first

    rawIdxResponse = authClient.transactionManager.loadIdxResponse(); // call idx.introspect if no existing idx response available in storage

    if (!rawIdxResponse) {
      var version = IDX_API_VERSION;
      var domain = getOAuthDomain(authClient);
      rawIdxResponse = yield idx.introspect(_objectSpread({
        domain,
        version
      }, options));
    }

    return idx.makeIdxState(rawIdxResponse);
  });
  return _introspect.apply(this, arguments);
}
//# sourceMappingURL=introspect.js.map