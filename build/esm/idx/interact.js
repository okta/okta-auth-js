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
import { getTransactionMeta, saveTransactionMeta } from './transactionMeta';
import { getOAuthBaseUrl } from '../oidc';

function getResponse(meta) {
  return {
    meta,
    interactionHandle: meta.interactionHandle,
    state: meta.state
  };
} // Begin or resume a transaction. Returns an interaction handle


export function interact(_x) {
  return _interact.apply(this, arguments);
}

function _interact() {
  _interact = _asyncToGenerator(function* (authClient) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var meta = yield getTransactionMeta(authClient); // Saved transaction, return meta

    if (meta.interactionHandle) {
      return getResponse(meta);
    } // These properties are always loaded from meta (or calculated fresh)


    var {
      codeChallenge,
      codeChallengeMethod
    } = meta; // These properties are defined by global configuration

    var {
      clientId,
      redirectUri
    } = authClient.options; // These properties can be set in options, but also have a default value in global configuration.

    var state = options.state || authClient.options.state || meta.state;
    var scopes = options.scopes || authClient.options.scopes || meta.scopes;
    var baseUrl = getOAuthBaseUrl(authClient);
    return idx.interact({
      // OAuth
      clientId,
      baseUrl,
      scopes,
      state,
      redirectUri,
      // PKCE
      codeChallenge,
      codeChallengeMethod
    }).then(interactionHandle => {
      var newMeta = _objectSpread(_objectSpread({}, meta), {}, {
        interactionHandle,
        state,
        scopes
      }); // Save transaction meta so it can be resumed


      saveTransactionMeta(authClient, newMeta);
      return getResponse(newMeta);
    });
  });
  return _interact.apply(this, arguments);
}
//# sourceMappingURL=interact.js.map