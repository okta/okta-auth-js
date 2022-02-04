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

/* eslint-disable max-len */
// @ts-nocheck
import { request } from '../client';
import { divideActionParamsByMutability } from './actionParser';
import { makeIdxState } from './makeIdxState';

const generateDirectFetch = function generateDirectFetch({ 
  actionDefinition, 
  defaultParamsForAction = {}, 
  immutableParamsForAction = {}, 
  toPersist 
}) {
  const target = actionDefinition.href;
  return async function(params) {
    const headers = {
      'content-type': 'application/json',
      'accept': actionDefinition.accepts || 'application/ion+json',
    };
    const body = JSON.stringify({
      ...defaultParamsForAction,
      ...params,
      ...immutableParamsForAction
    });
    const credentials = toPersist && toPersist.withCredentials === false ? 'omit' : 'include';
    return request(target, { method: actionDefinition.method, headers, body, credentials })
      .then( response => {
        const respJson = response.json();
        if (response.ok) {
          return respJson;
        } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'Oktadevicejwt realm="Okta Device"') {
          // Okta server responds 401 status code with WWW-Authenticate header and new remediation
          // so that the iOS/MacOS credential SSO extension (Okta Verify) can intercept
          // the response reaches here when Okta Verify is not installed
          // we need to return an idx object so that
          // the SIW can proceed to the next step without showing error
          return respJson.then(err => {
            let ms = makeIdxState(err, toPersist);
            // set to true if flow should be continued without showing any errors
            ms.stepUp = true;
            return Promise.reject(ms);
          });
        }
        return respJson.then(err => {
          return Promise.reject(makeIdxState(err, toPersist));
        });
      })
      .then( idxResponse => makeIdxState(idxResponse, toPersist) );
  };
};

// TODO: Resolve in M2: Either build the final polling solution or remove this code
// const generatePollingFetch = function generatePollingFetch( { actionDefinition, defaultParamsForAction = {}, immutableParamsForAction = {} } ) {
//   // TODO: Discussions ongoing about when/how to terminate polling: OKTA-246581
//   const target = actionDefinition.href;
//   return async function(params) {
//     return fetch(target, {
//       method: actionDefinition.method,
//       headers: {
//         'content-type': actionDefinition.accepts,
//       },
//       body: JSON.stringify({ ...defaultParamsForAction, ...params, ...immutableParamsForAction })
//     })
//       .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
//       .then( idxResponse => makeIdxState(idxResponse) );
//   };
// };

const generateIdxAction = function generateIdxAction( actionDefinition, toPersist ) {
  // TODO: leaving this here to see where the polling is EXPECTED to drop into the code, but removing any accidental trigger of incomplete code
  // const generator =  actionDefinition.refresh ? generatePollingFetch : generateDirectFetch;
  const generator = generateDirectFetch;
  const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( actionDefinition );

  const action = generator( {
    actionDefinition,
    defaultParamsForAction: defaultParams[actionDefinition.name],
    immutableParamsForAction: immutableParams[actionDefinition.name],
    toPersist
  });
  action.neededParams = neededParams;
  return action;
};

export default generateIdxAction;
