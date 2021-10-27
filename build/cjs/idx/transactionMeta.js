"use strict";

exports.createTransactionMeta = createTransactionMeta;
exports.transactionMetaExist = transactionMetaExist;
exports.getTransactionMeta = getTransactionMeta;
exports.saveTransactionMeta = saveTransactionMeta;
exports.clearTransactionMeta = clearTransactionMeta;
exports.isTransactionMetaValid = isTransactionMetaValid;

var _util = require("../util");

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
// Calculate new values
async function createTransactionMeta(authClient) {
  return authClient.token.prepareTokenParams();
}

function transactionMetaExist(authClient) {
  if (authClient.transactionManager.exists()) {
    const existing = authClient.transactionManager.load();

    if (isTransactionMetaValid(authClient, existing) && existing.interactionHandle) {
      return true;
    }
  }

  return false;
}

async function getTransactionMeta(authClient) {
  // Load existing transaction meta from storage
  if (authClient.transactionManager.exists()) {
    const existing = authClient.transactionManager.load();

    if (isTransactionMetaValid(authClient, existing)) {
      return existing;
    } // existing meta is not valid for this configuration
    // this is common when changing configuration in local development environment
    // in a production environment, this may indicate that two apps are sharing a storage key


    (0, _util.warn)('Saved transaction meta does not match the current configuration. ' + 'This may indicate that two apps are sharing a storage key.');
  } // Calculate new values


  const tokenParams = await authClient.token.prepareTokenParams();
  const urls = (0, _oidc.getOAuthUrls)(authClient, tokenParams);
  const issuer = authClient.options.issuer;
  const {
    pkce,
    clientId,
    redirectUri,
    responseType,
    responseMode,
    scopes,
    state,
    nonce,
    ignoreSignature,
    codeVerifier,
    codeChallengeMethod,
    codeChallenge
  } = tokenParams;
  const meta = {
    issuer,
    pkce,
    clientId,
    redirectUri,
    responseType,
    responseMode,
    scopes,
    state,
    nonce,
    urls,
    ignoreSignature,
    codeVerifier,
    codeChallengeMethod,
    codeChallenge
  };
  return meta;
}

function saveTransactionMeta(authClient, meta) {
  authClient.transactionManager.save(meta);
}

function clearTransactionMeta(authClient) {
  authClient.transactionManager.clear();
} // returns true if values in meta match current authClient options


function isTransactionMetaValid(authClient, meta) {
  const keys = ['issuer', 'clientId', 'redirectUri'];
  const mismatch = keys.find(key => {
    return authClient.options[key] !== meta[key];
  });
  return !mismatch;
}
//# sourceMappingURL=transactionMeta.js.map