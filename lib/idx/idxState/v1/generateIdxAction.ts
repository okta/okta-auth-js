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

/* eslint-disable max-len, complexity */
import { httpRequest } from '../../../http';
import { OktaAuthIdxInterface } from '../../types';    // auth-js/types
import { IdxActionFunction, IdxActionParams, IdxResponse, IdxToPersist } from '../../types/idx-js';
import { divideActionParamsByMutability } from './actionParser';
import AuthApiError from '../../../errors/AuthApiError';

const generateDirectFetch = function generateDirectFetch(authClient: OktaAuthIdxInterface, { 
  actionDefinition, 
  defaultParamsForAction = {}, 
  immutableParamsForAction = {}, 
  toPersist = {} as IdxToPersist
}): IdxActionFunction {
  const target = actionDefinition.href;
  return async function(params: IdxActionParams = {}): Promise<IdxResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': actionDefinition.accepts || 'application/ion+json',
    };
    const body = JSON.stringify({
      ...defaultParamsForAction,
      ...params,
      ...immutableParamsForAction
    });

    try {
      const response = await httpRequest(authClient, {
        url: target,
        method: actionDefinition.method,
        headers,
        args: body,
        withCredentials: toPersist?.withCredentials ?? true
      });

      return authClient.idx.makeIdxResponse({ ...response }, toPersist, true);
    }
    catch (err) {
      if (!(err instanceof AuthApiError) || !err?.xhr) {
        throw err;
      }

      const response = err.xhr;
      const payload = response.responseJSON || JSON.parse(response.responseText);
      const wwwAuthHeader = response.headers['WWW-Authenticate'] || response.headers['www-authenticate'];

      const idxResponse = authClient.idx.makeIdxResponse({ ...payload }, toPersist, false);
      if (response.status === 401 && wwwAuthHeader === 'Oktadevicejwt realm="Okta Device"') {
        // Okta server responds 401 status code with WWW-Authenticate header and new remediation
        // so that the iOS/MacOS credential SSO extension (Okta Verify) can intercept
        // the response reaches here when Okta Verify is not installed
        // set `stepUp` to true if flow should be continued without showing any errors
        idxResponse.stepUp = true;
      }

      return idxResponse;
    }
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
//       .then( idxResponse => makeIdxState(authClient, idxResponse) );
//   };
// };

const generateIdxAction = function generateIdxAction( authClient: OktaAuthIdxInterface, actionDefinition, toPersist ): IdxActionFunction {
  // TODO: leaving this here to see where the polling is EXPECTED to drop into the code, but removing any accidental trigger of incomplete code
  // const generator =  actionDefinition.refresh ? generatePollingFetch : generateDirectFetch;
  const generator = generateDirectFetch;
  const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( actionDefinition );

  const action = generator(authClient, {
    actionDefinition,
    defaultParamsForAction: defaultParams[actionDefinition.name],
    immutableParamsForAction: immutableParams[actionDefinition.name],
    toPersist
  });
  action.neededParams = neededParams;
  return action;
};

export default generateIdxAction;
