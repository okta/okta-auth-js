/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// @ts-nocheck
import introspect from './introspect';
import interact from './interact';
import parsersForVersion from './parsers';
import { HttpClient } from './client';
import { validateVersionConfig } from './util';

const LATEST_SUPPORTED_IDX_API_VERSION = '1.0.0';

const start = async function start({
  withCredentials,
  clientId,
  domain,
  issuer,
  stateHandle,
  interactionHandle,
  version,
  redirectUri,
  state,
  scopes,
  codeChallenge,
  codeChallengeMethod,
  activationToken,
  recoveryToken
}) {

  issuer = issuer?.replace(/\/+$/, '');
  const baseUrl = issuer?.indexOf('/oauth2') > 0 ? issuer : issuer + '/oauth2'; // org AS uses domain as AS, but we need the base url for calls
  const toPersist = {
    baseUrl,
    clientId,
    state,
    withCredentials
  };

  if ( !domain && !issuer) {
    return Promise.reject({ error: 'issuer is required' });
  }

  if ( !stateHandle && !clientId ) { // redirectUri is only required on self-hosted flow
    return Promise.reject({ error: 'clientId is required' });
  }

  if ( !stateHandle && !redirectUri ) { // redirectUri is only required on self-hosted flow
    return Promise.reject({ error: 'redirectUri is required' });
  }

  if (!stateHandle && !(codeChallenge && codeChallengeMethod)) {
    return Promise.reject({ error: 'PKCE params (codeChallenge, codeChallengeMethod) are required' });
  }

  if ( !domain ) {
    domain = new URL(issuer).origin;
  }

  validateVersionConfig(version);

  if ( !stateHandle && !interactionHandle ) { // start a new transaction
    try {
      const interactParams = {
        withCredentials,
        clientId,
        baseUrl,
        scopes,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
        state,
        activationToken,
        recoveryToken
      };

      const interaction_handle = await interact( interactParams );
      interactionHandle = interaction_handle;
      toPersist.interactionHandle = interactionHandle;
    } catch (error) {
      return Promise.reject({ error });
    }
  }

  try {
    const { makeIdxState } = parsersForVersion(version);
    const idxResponse = await introspect({ withCredentials, domain, interactionHandle, stateHandle, version })
      .catch( err => Promise.reject({
        error: 'introspect call failed',
        // Transform all errors into an IdX State object.
        // This allows IdX based errors (messages) to optionally proceed with remediation forms
        details: makeIdxState( err, toPersist )
      }) );
    const idxState = makeIdxState( idxResponse, toPersist );
    return idxState;
  } catch (error) {
    return Promise.reject({ error });
  }
};
const { makeIdxState } = parsersForVersion(LATEST_SUPPORTED_IDX_API_VERSION);

export default {
  start,
  introspect,
  interact,
  makeIdxState,
  client: HttpClient,
  LATEST_SUPPORTED_IDX_API_VERSION,
};
