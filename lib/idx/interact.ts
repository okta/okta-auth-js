/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
/* eslint complexity:[0,8] */
import idx from '@okta/okta-idx-js';
import { OktaAuth, IdxTransactionMeta } from '../types';
import { getSavedTransactionMeta, saveTransactionMeta } from './transactionMeta';
import { getOAuthBaseUrl } from '../oidc';
import { createTransactionMeta } from '.';
import { removeNils } from '../util';

export interface InteractOptions {
  withCredentials?: boolean;
  state?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: string;
  activationToken?: string;
  recoveryToken?: string;
}

export interface InteractResponse {
  state?: string;
  interactionHandle: string;
  meta: IdxTransactionMeta;
}

function getResponse(meta: IdxTransactionMeta): InteractResponse {
  return {
    meta,
    interactionHandle: meta.interactionHandle!,
    state: meta.state
  };
}

// Begin or resume a transaction. Returns an interaction handle
export async function interact (authClient: OktaAuth, options: InteractOptions = {}): Promise<InteractResponse> {
  options = removeNils(options);

  let meta = getSavedTransactionMeta(authClient, options);
  // If meta exists, it has been validated against all options

  if (meta?.interactionHandle) {
    return getResponse(meta); // Saved transaction, return meta
  }

  // Create new meta, respecting previous meta if it has been set and is not overridden
  meta = await createTransactionMeta(authClient, { ...meta, ...options });
  const baseUrl = getOAuthBaseUrl(authClient);
  let {
    clientId,
    redirectUri,
    state,
    scopes,
    withCredentials,
    codeChallenge,
    codeChallengeMethod,
    activationToken,
    recoveryToken
  } = meta as IdxTransactionMeta;

  const interactionHandle = await idx.interact({
    withCredentials,

    // OAuth
    clientId, 
    baseUrl,
    scopes,
    state,
    redirectUri,

    // PKCE
    codeChallenge,
    codeChallengeMethod,

    // Activation
    activationToken,
    
    // Recovery
    recoveryToken
  });
  const newMeta = {
    ...meta,
    interactionHandle,
    
    // Options which can be passed into interact() should be saved in the meta
    withCredentials,
    state,
    scopes,
    recoveryToken,
    activationToken
  };
  // Save transaction meta so it can be resumed
  saveTransactionMeta(authClient, newMeta);

  return getResponse(newMeta);
}
