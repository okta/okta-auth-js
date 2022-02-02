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
import { Remediator, RemediationValues } from './remediators';
import { NextStep, IdxMessage, FlowIdentifier } from './types';
import { RemediationFlow } from './flow';
import { 
  IdxResponse,  
  IdxRemediation,
  isIdxResponse, 
} from './types/idx-js';
import { canResendFn, canSkipFn, getMessagesFromResponse, isTerminalResponse } from './util';

interface RemediationResponse {
  idxResponse: IdxResponse;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  terminal?: boolean;
  canceled?: boolean;
}
export interface RemediateOptions {
  remediators?: RemediationFlow;
  actions?: string[];
  flow?: FlowIdentifier;
  step?: string;
}

// Return first match idxRemediation in allowed remediators
export function getRemediator(
  idxRemediations: IdxRemediation[],
  values: RemediationValues,
  options: RemediateOptions,
): Remediator | undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const remediators = options.remediators!;

  let remediator;
  // remediation name specified by caller - fast-track remediator lookup 
  if (options.step) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediation = idxRemediations.find(({ name }) => name === options.step)!;
    const T = remediators[remediation.name];
    return T ? new T(remediation, values) : undefined;
  }

  const remediatorCandidates = [];
  for (let remediation of idxRemediations) {
    const isRemeditionInFlow = Object.keys(remediators as object).includes(remediation.name);
    if (!isRemeditionInFlow) {
      continue;
    }

    const T = remediators[remediation.name];
    remediator = new T(remediation, values);
    if (remediator.canRemediate()) {
      // found the remediator
      return remediator;
    }
    // remediator cannot handle the current values
    // maybe return for next step
    remediatorCandidates.push(remediator as never);  
  }
  
  return remediatorCandidates[0];
}

function getNextStep(
  remediator: Remediator, idxResponse: IdxResponse
): NextStep {
  const nextStep = remediator.getNextStep(idxResponse.context);
  const canSkip = canSkipFn(idxResponse);
  const canResend = canResendFn(idxResponse);
  return {
    ...nextStep,
    ...(canSkip && {canSkip}),
    ...(canResend && {canResend}),
  };
}

function handleIdxError(e, remediator?): RemediationResponse {
  // Handle idx messages
  const idxResponse = isIdxResponse(e) ? e : null;
  if (!idxResponse) {
    // Thrown error terminates the interaction with idx
    throw e;
  }
  const terminal = isTerminalResponse(idxResponse);
  const messages = getMessagesFromResponse(idxResponse);
  if (terminal) {
    return { idxResponse, terminal, messages };
  } else {
    const nextStep = remediator && getNextStep(remediator, idxResponse);
    return { 
      idxResponse,
      messages, 
      ...(nextStep && { nextStep }) 
    };
  }
}

function getActionFromValues(values, idxResponse: IdxResponse): string | undefined {
  // Currently support resend actions only
  return Object.keys(idxResponse.actions).find(action => !!values.resend && action.includes('-resend'));
}

function removeActionFromValues(values) {
  // Currently support resend actions only
  values.resend = undefined;
  return values;
}

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues,
  options: RemediateOptions
): Promise<RemediationResponse> {
  let { neededToProceed, interactionCode } = idxResponse;
  const { remediators, flow } = options;

  // If the response contains an interaction code, there is no need to remediate
  if (interactionCode) {
    return { idxResponse };
  }

  // Reach to terminal state
  const terminal = isTerminalResponse(idxResponse);
  const messages = getMessagesFromResponse(idxResponse);
  if (terminal) {
    return { idxResponse, terminal, messages };
  }
  
  // Try actions in idxResponse first
  const actionFromValues = getActionFromValues(values, idxResponse);
  const actions = [
    ...options.actions || [],
    ...(actionFromValues && [actionFromValues] || []),
  ];
  if (actions) {
    for (let action of actions) {
      let valuesWithoutExecutedAction = removeActionFromValues(values);
      if (typeof idxResponse.actions[action] === 'function') {
        try {
          idxResponse = await idxResponse.actions[action]();
        } catch (e) {
          return handleIdxError(e, remediators);
        }
        if (action === 'cancel') {
          return { idxResponse, canceled: true };
        }
        return remediate(idxResponse, valuesWithoutExecutedAction, options); // recursive call
      }

      // search for action in remediation list
      const remediationAction = neededToProceed.find(({ name }) => name === action);
      if (remediationAction) {
        try {
          idxResponse = await idxResponse.proceed(action, {});
        }
        catch (e) {
          return handleIdxError(e, remediators);
        }

        return remediate(idxResponse, values, options); // recursive call
      }
    }
  }

  const remediator = getRemediator(neededToProceed, values, options);
  if (!remediator) {
    if (options.step) {
      idxResponse = await idxResponse.proceed(options.step, values);
      return { idxResponse };
    }
    if (flow === 'default') {
      return { idxResponse };
    }
    throw new AuthSdkError(`
      No remediation can match current flow, check policy settings in your org.
      Remediations: [${neededToProceed.reduce((acc, curr) => acc ? acc + ' ,' + curr.name : curr.name, '')}]
    `);
  }

  if (messages.length) {
    const nextStep = getNextStep(remediator, idxResponse);
    return { idxResponse, nextStep, messages };
  }

  // Return next step to the caller
  if (!remediator.canRemediate()) {
    const nextStep = getNextStep(remediator, idxResponse);
    return { idxResponse, nextStep };
  }

  const name = remediator.getName();
  const data = remediator.getData();
  try {
    idxResponse = await idxResponse.proceed(name, data);

    // We may want to trim the values bag for the next remediation
    // Let the remediator decide what the values should be (default to current values)
    values = remediator.getValuesAfterProceed();
    delete options.step; // do not re-use the step
    return remediate(idxResponse, values, options); // recursive call
  } catch (e) {
    return handleIdxError(e, remediator);
  }
}
