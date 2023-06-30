/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* eslint-disable max-statements, max-depth, complexity */
import { AuthSdkError } from '../errors';
import { RemediationValues } from './remediators';
import { OktaAuthIdxInterface, RemediateOptions, RemediationResponse } from './types';
import { 
  IdxResponse,
  IdxActionParams, 
} from './types/idx-js';
import {
  isTerminalResponse,
  filterValuesForRemediation,
  getRemediator,
  getNextStep,
  handleFailedResponse
} from './util';

export interface RemediateActionWithOptionalParams {
  name: string;
  params?: IdxActionParams;
}

export type RemediateAction = string | RemediateActionWithOptionalParams;


function getActionFromValues(values: RemediationValues, idxResponse: IdxResponse): string | undefined {
  // Currently support resend actions only
  return Object.keys(idxResponse.actions).find(action => !!values.resend && action.includes('-resend'));
}

function removeActionFromValues(values: RemediationValues): RemediationValues {
  // Currently support resend actions only
  return {
    ...values,
    resend: undefined
  };
}

function removeActionFromOptions(options: RemediateOptions, actionName: string): RemediateOptions {
  let actions = options.actions || [];
  actions = actions.filter(entry => {
    if (typeof entry === 'string') {
      return entry !== actionName;
    }
    return entry.name !== actionName;
  });

  return { ...options, actions };
}

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  authClient: OktaAuthIdxInterface,
  idxResponse: IdxResponse,
  values: RemediationValues,
  options: RemediateOptions
): Promise<RemediationResponse> {
  let { neededToProceed, interactionCode } = idxResponse;
  const { flow } = options;

  // If the response contains an interaction code, there is no need to remediate
  if (interactionCode) {
    return { idxResponse };
  }

  const remediator = getRemediator(idxResponse, values, options);

  // Try actions in idxResponse first
  const actionFromValues = getActionFromValues(values, idxResponse);
  const actionFromOptions = options.actions || [];
  const actions = [
    ...actionFromOptions,
    ...(actionFromValues && [actionFromValues] || []),
  ];
  if (actions) {
    for (let action of actions) {
      // Action can either be specified as a string, or as an object with name and optional params
      let params: IdxActionParams = {};
      if (typeof action !== 'string') {
        params = action.params || {};
        action = action.name;
      }
      let valuesWithoutExecutedAction = removeActionFromValues(values);
      let optionsWithoutExecutedAction = removeActionFromOptions(options, action);

      if (typeof idxResponse.actions[action] === 'function') {
        idxResponse = await idxResponse.actions[action](params);
        if (idxResponse.requestDidSucceed === false) {
          return handleFailedResponse(authClient, idxResponse, options);
        }
        if (action === 'cancel') {
          return { idxResponse, canceled: true };
        }
        return remediate(
          authClient, 
          idxResponse, 
          valuesWithoutExecutedAction, 
          optionsWithoutExecutedAction
        ); // recursive call
      }

      // search for action in remediation list
      const remediationAction = neededToProceed.find(({ name }) => name === action);
      if (remediationAction) {
        idxResponse = await idxResponse.proceed(action, params);
        if (idxResponse.requestDidSucceed === false) {
          return handleFailedResponse(authClient, idxResponse, options);
        }
        return remediate(authClient, idxResponse, values, optionsWithoutExecutedAction); // recursive call
      }
    }
  }

  // Do not attempt to remediate if response is in terminal state
  const terminal = isTerminalResponse(idxResponse);
  if (terminal) {
    return { idxResponse, terminal };
  }

  if (!remediator) {
    // With options.step, remediator is not required
    if (options.step) {
      values = filterValuesForRemediation(idxResponse, options.step, values); // include only requested values
      idxResponse = await idxResponse.proceed(options.step, values);
      if (idxResponse.requestDidSucceed === false) {
        return handleFailedResponse(authClient, idxResponse, options);
      }
      return { idxResponse };
    }

    // With default flow, remediator is not required
    if (flow === 'default') {
      return { idxResponse };
    }
    throw new AuthSdkError(`
      No remediation can match current flow, check policy settings in your org.
      Remediations: [${neededToProceed.reduce((acc, curr) => acc ? acc + ' ,' + curr.name : curr.name, '')}]
    `);
  }

  // Return next step to the caller
  if (!remediator.canRemediate()) {
    const nextStep = getNextStep(authClient, remediator, idxResponse);
    return {
      idxResponse,
      nextStep,
    };
  }

  const name = remediator.getName();
  const data = remediator.getData();

  idxResponse = await idxResponse.proceed(name, data);
  if (idxResponse.requestDidSucceed === false) {
    return handleFailedResponse(authClient, idxResponse, options);
  }
  // We may want to trim the values bag for the next remediation
  // Let the remediator decide what the values should be (default to current values)
  values = remediator.getValuesAfterProceed();
  options = { ...options, step: undefined }; // do not re-use the step

  // generic remediator should not auto proceed in pending status
  // return nextStep directly
  if (options.useGenericRemediator && !idxResponse.interactionCode && !isTerminalResponse(idxResponse)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gr = getRemediator(idxResponse, values, options)!;
    const nextStep = getNextStep(authClient, gr, idxResponse);
    return {
      idxResponse,
      nextStep,
    };
  }
  
  return remediate(authClient, idxResponse, values, options); // recursive call

}
