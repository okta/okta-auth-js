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

// BaseLoginRouter contains the more complicated router logic - rendering/
// transition, etc. Most router changes should happen in LoginRouter (which is
// responsible for adding new routes)

import idx from '@okta/okta-idx-js';
import { InteractOptions, OktaAuth, InteractResponse } from '../types';
import { IDX_API_VERSION } from '../constants';
import { getTransactionMeta, saveTransactionMeta } from './transactionMeta';

// Begin or resume a transaction. Returns an interaction handle
export async function interact (authClient: OktaAuth, options?: InteractOptions): Promise<InteractResponse> {

  let meta = await getTransactionMeta(authClient);

  // These properties are always loaded from meta (or calculated fresh)
  const {
    interactionHandle,
    codeVerifier,
    codeChallenge,
    codeChallengeMethod
  } = meta;

  // These properties are defined by global configuration
  const { issuer, clientId, redirectUri } = authClient.options;
  const version = IDX_API_VERSION;

  // These properties can be set in options, but also have a default value in global configuration.
  let state = options.state || authClient.options.state;
  let scopes = options.scopes || authClient.options.scopes;

  if (!interactionHandle) {
    // new transaction: prefer configured values
    state = state || meta.state;
    scopes = scopes || meta.scopes;
  } else {
    // saved transaction: use only saved values
    state = meta.state;
    scopes = meta.scopes;
  }

  return idx.start({
    // if interactionHandle is undefined here, idx will bootstrap a new interactionHandle
    interactionHandle,
    version,

    // OAuth
    clientId, 
    issuer,
    scopes,
    state,
    redirectUri,

    // PKCE
    codeVerifier,
    codeChallenge,
    codeChallengeMethod
  })
    .then(idxResponse => {
      // If this is a new transaction an interactionHandle was returned
      if (!interactionHandle && idxResponse.toPersist.interactionHandle) {
        meta = Object.assign({}, meta, {
          interactionHandle: idxResponse.toPersist.interactionHandle
        });
      }

      // Save transaction meta so it can be resumed
      saveTransactionMeta(authClient, meta);

      return {
        idxResponse,
        interactionHandle: meta.interactionHandle,
        meta,
        stateHandle: idxResponse.context.stateHandle,
        state
      };
    });
}
