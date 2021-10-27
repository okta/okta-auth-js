"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.interact = interact;

var _oktaIdxJs = _interopRequireDefault(require("@okta/okta-idx-js"));

var _transactionMeta = require("./transactionMeta");

var _oidc = require("../oidc");

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
function getResponse(meta) {
  return {
    meta,
    interactionHandle: meta.interactionHandle,
    state: meta.state
  };
} // Begin or resume a transaction. Returns an interaction handle


async function interact(authClient, options = {}) {
  const meta = await (0, _transactionMeta.getTransactionMeta)(authClient); // Saved transaction, return meta

  if (meta.interactionHandle) {
    return getResponse(meta);
  } // These properties are always loaded from meta (or calculated fresh)


  const {
    codeChallenge,
    codeChallengeMethod
  } = meta; // These properties are defined by global configuration

  const {
    clientId,
    redirectUri
  } = authClient.options; // These properties can be set in options, but also have a default value in global configuration.

  const state = options.state || authClient.options.state || meta.state;
  const scopes = options.scopes || authClient.options.scopes || meta.scopes;
  const baseUrl = (0, _oidc.getOAuthBaseUrl)(authClient);
  return _oktaIdxJs.default.interact({
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
    const newMeta = { ...meta,
      interactionHandle,
      state,
      scopes
    }; // Save transaction meta so it can be resumed

    (0, _transactionMeta.saveTransactionMeta)(authClient, newMeta);
    return getResponse(newMeta);
  });
}
//# sourceMappingURL=interact.js.map