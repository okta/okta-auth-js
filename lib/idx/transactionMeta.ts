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

import { OktaAuth, IdxTransactionMeta, TransactionMetaOptions } from '../types';
import { warn } from '../util';
import { getOAuthUrls } from '../oidc';

// Calculate new values
export async function createTransactionMeta(authClient: OktaAuth) {
  return authClient.token.prepareTokenParams();
}

export function transactionMetaExist(authClient: OktaAuth, options?: TransactionMetaOptions): boolean {
  if (authClient.transactionManager.exists(options)) {
    const existing = authClient.transactionManager.load(options) as IdxTransactionMeta;
    if (isTransactionMetaValid(authClient, existing) && existing.interactionHandle) {
      return true;
    }
  }
  return false;
}

// Returns the saved transaction meta, if it exists and is valid, or undefined
export function getSavedTransactionMeta(authClient: OktaAuth, options?: TransactionMetaOptions): IdxTransactionMeta {
  const state = options?.state || authClient.options.state;
  const existing = authClient.transactionManager.load({ state }) as IdxTransactionMeta;
  if (existing && isTransactionMetaValid(authClient, existing)) {
    return existing;
  }
}

export async function getTransactionMeta(
  authClient: OktaAuth,
  options?: TransactionMetaOptions
): Promise<IdxTransactionMeta> {
  // Load existing transaction meta from storage
  if (authClient.transactionManager.exists(options)) {
    const validExistingMeta = getSavedTransactionMeta(authClient, options);
    if (validExistingMeta) {
      return validExistingMeta;
    }
    // existing meta is not valid for this configuration
    // this is common when changing configuration in local development environment
    // in a production environment, this may indicate that two apps are sharing a storage key
    warn('Saved transaction meta does not match the current configuration. ' + 
      'This may indicate that two apps are sharing a storage key.');
  }

  // Calculate new values
  const tokenParams = await authClient.token.prepareTokenParams();
  const urls = getOAuthUrls(authClient, tokenParams);
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
    codeChallenge,
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

export function saveTransactionMeta (authClient: OktaAuth, meta) {
  authClient.transactionManager.save(meta, { muteWarning: true });
}

export function clearTransactionMeta (authClient: OktaAuth) {
  authClient.transactionManager.clear();
}

// returns true if values in meta match current authClient options
export function isTransactionMetaValid (authClient: OktaAuth, meta) {
  const keys = ['issuer', 'clientId', 'redirectUri'];
  const mismatch = keys.find(key => {
    return authClient.options[key] !== meta[key];
  });
  return !mismatch;
}
