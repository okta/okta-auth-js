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
import { RunOptions, RemediationFlow } from './run';
import { NextStep, IdxMessage } from './types';
import { 
  IdxResponse,  
  IdxRemediation,
  isIdxResponse, 
} from './types/idx-js';

interface RemediationResponse {
  idxResponse?: IdxResponse;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  terminal?: boolean;
  canceled?: boolean;
}
// Return first match idxRemediation in allowed remediators
export function getRemediator(
  idxRemediations: IdxRemediation[],
  values: RemediationValues,
  options: RunOptions,
): Remediator {
  const { flow, flowMonitor } = options;

  let remediator;
  const remediatorCandidates = [];
  for (let remediation of idxRemediations) {
    const isRemeditionInFlow = Object.keys(flow).includes(remediation.name);
    if (!isRemeditionInFlow) {
      continue;
    }
      
    const T = flow[remediation.name];
    remediator = new T(remediation, values);
    if (flowMonitor.isRemediatorCandidate(remediator, idxRemediations, values)) {
      if (remediator.canRemediate()) {
        // found the remediator
        return remediator;
      }
      // remediator cannot handle the current values
      // maybe return for next step
      remediatorCandidates.push(remediator);  
    }
  }
  
  // TODO: why is it a problem to have multiple remediations? 
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-400758
  // if (remediatorCandidates.length > 1) {
  //   const remediationNames = remediatorCandidates.reduce((acc, curr) => {
  //     const name = curr.getName();
  //     return acc ? `${acc}, ${name}` : name;
  //   }, '');
  //   throw new AuthSdkError(`
  //     More than one remediation can match the current input, remediations: ${remediationNames}
  //   `);
  // }

  return remediatorCandidates[0];
}

function isTerminalResponse(idxResponse: IdxResponse) {
  const { neededToProceed, interactionCode } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}

function canSkipFn(idxResponse: IdxResponse) {
  return idxResponse.neededToProceed.some(({ name }) => name === 'skip');
}

function canResendFn(idxResponse: IdxResponse) {
  return Object.keys(idxResponse.actions).some(actionName => actionName.includes('resend'));
}

function getIdxMessages(
  idxResponse: IdxResponse, flow: RemediationFlow
): IdxMessage[] {
  let messages = [];
  if (!flow) {
    return messages;
  }

  const { rawIdxState, neededToProceed } = idxResponse;

  // Handle global messages
  const globalMessages = rawIdxState.messages?.value.map(message => message);
  if (globalMessages) {
    messages = [...messages, ...globalMessages];
  }

  // Handle field messages for current flow
  for (let remediation of neededToProceed) {
    const T = flow[remediation.name];
    if (!T) {
      continue;
    }
    const remediator = new T(remediation);
    const fieldMessages = remediator.getMessages();
    if (fieldMessages) {
      messages = [...messages, ...fieldMessages];
    }
  }

  return messages;
}

function getNextStep(
  remediator: Remediator, idxResponse: IdxResponse
): NextStep {
  const nextStep = remediator.getNextStep();
  const canSkip = canSkipFn(idxResponse);
  const canResend = canResendFn(idxResponse);
  return {
    ...nextStep,
    ...(canSkip && {canSkip}),
    ...(canResend && {canResend}),
  };
}

function handleIdxError(e, flow, remediator?) {
  // Handle idx messages
  const idxState: IdxResponse = isIdxResponse(e) ? e : null;
  if (!idxState) {
    // Thrown error terminates the interaction with idx
    throw e;
  }
  const terminal = isTerminalResponse(idxState);
  const messages = getIdxMessages(idxState, flow);
  if (terminal) {
    return { terminal, messages };
  } else {
    const nextStep = remediator && getNextStep(remediator, idxState);
    return { 
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
  options: RunOptions
): Promise<RemediationResponse> {
  let { neededToProceed, interactionCode } = idxResponse;
  const { flow, flowMonitor } = options;

  // If the response contains an interaction code, there is no need to remediate
  if (interactionCode) {
    return { idxResponse };
  }

  // Reach to terminal state
  const terminal = isTerminalResponse(idxResponse);
  const messages = getIdxMessages(idxResponse, flow);
  if (terminal) {
    return { terminal, messages };
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
          return handleIdxError(e, flow);
        }
        if (action === 'cancel') {
          return { canceled: true };
        }
        return remediate(idxResponse, valuesWithoutExecutedAction, options); // recursive call
      }
    }
  }

  const remediator = getRemediator(neededToProceed, values, options);
  
  if (!remediator) {
    throw new AuthSdkError(`
      No remediation can match current flow, check policy settings in your org.
      Remediations: [${neededToProceed.reduce((acc, curr) => acc ? acc + ' ,' + curr.name : curr.name, '')}]
    `);
  }

  if (flowMonitor.loopDetected(remediator)) {
    throw new AuthSdkError(`
      Remediation run into loop, break!!! remediation: ${remediator.getName()}
    `);
  }

  // Recursive loop breaker
  // Return next step to the caller
  if (!remediator.canRemediate()) {
    const nextStep = getNextStep(remediator, idxResponse);
    return { idxResponse, nextStep };
  }

  const name = remediator.getName();
  const data = remediator.getData();
  try {
    idxResponse = await idxResponse.proceed(name, data);

    // Track succeed remediations in the current transaction
    await flowMonitor.trackRemediations(name);
    
    // Successfully get interaction code
    if (idxResponse.interactionCode) {
      return { idxResponse };
    }

    // Reach to terminal state
    const terminal = isTerminalResponse(idxResponse);
    const messages = getIdxMessages(idxResponse, flow);
    if (terminal) {
      return { terminal, messages };
    }

    // Handle idx message in nextStep
    if (messages.length) {
      const nextStep = getNextStep(remediator, idxResponse);
      return { nextStep, messages };
    }
    
    // We may want to trim the values bag for the next remediation
    // Let the remediator decide what the values should be (default to current values)
    values = remediator.getValuesAfterProceed();
    return remediate(idxResponse, values, options); // recursive call
  } catch (e) {
    return handleIdxError(e, flow, remediator);
  }
}
