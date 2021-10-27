import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

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
import { warn } from '../util';
import { getOAuthUrls } from '../oidc'; // Calculate new values

export function createTransactionMeta(_x) {
  return _createTransactionMeta.apply(this, arguments);
}

function _createTransactionMeta() {
  _createTransactionMeta = _asyncToGenerator(function* (authClient) {
    return authClient.token.prepareTokenParams();
  });
  return _createTransactionMeta.apply(this, arguments);
}

export function transactionMetaExist(authClient) {
  if (authClient.transactionManager.exists()) {
    var existing = authClient.transactionManager.load();

    if (isTransactionMetaValid(authClient, existing) && existing.interactionHandle) {
      return true;
    }
  }

  return false;
}
export function getTransactionMeta(_x2) {
  return _getTransactionMeta.apply(this, arguments);
}

function _getTransactionMeta() {
  _getTransactionMeta = _asyncToGenerator(function* (authClient) {
    // Load existing transaction meta from storage
    if (authClient.transactionManager.exists()) {
      var existing = authClient.transactionManager.load();

      if (isTransactionMetaValid(authClient, existing)) {
        return existing;
      } // existing meta is not valid for this configuration
      // this is common when changing configuration in local development environment
      // in a production environment, this may indicate that two apps are sharing a storage key


      warn('Saved transaction meta does not match the current configuration. ' + 'This may indicate that two apps are sharing a storage key.');
    } // Calculate new values


    var tokenParams = yield authClient.token.prepareTokenParams();
    var urls = getOAuthUrls(authClient, tokenParams);
    var issuer = authClient.options.issuer;
    var {
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
    var meta = {
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
  });
  return _getTransactionMeta.apply(this, arguments);
}

export function saveTransactionMeta(authClient, meta) {
  authClient.transactionManager.save(meta);
}
export function clearTransactionMeta(authClient) {
  authClient.transactionManager.clear();
} // returns true if values in meta match current authClient options

export function isTransactionMetaValid(authClient, meta) {
  var keys = ['issuer', 'clientId', 'redirectUri'];
  var mismatch = keys.find(key => {
    return authClient.options[key] !== meta[key];
  });
  return !mismatch;
}
//# sourceMappingURL=transactionMeta.js.map