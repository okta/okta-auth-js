/* eslint-disable max-statements */
/* eslint-disable complexity */
import idx from '@okta/okta-idx-js';
import { AuthSdkError } from '../errors';
import { Base as Remediator } from './remediators';
import { RunOptions } from './run';
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationFlow, 
  RemediationValues,
  NextStep,
  IdxRemediation,
  IdxMessage,
} from '../types';
import { canSkip as canSkipFn } from './util';

interface RemediationResponse {
  idxResponse?: IdxResponse;
  nextStep?: NextStep;
  canSkip?: boolean;
  messages?: IdxMessage[];
  terminal?: boolean;
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
    if (remediator.canRemediate()) {
      // found the remediator
      return remediator;
    } else if (flowMonitor.isRemediatorCandidate(remediator)) {
      // remediator cannot handle the current values
      // maybe return for next step
      remediatorCandidates.push(remediator);
    }
  }
  
  if (remediatorCandidates.length > 1) {
    throw new AuthSdkError('More than one remediation can match the current input');
  }

  return remediatorCandidates[0];
}

function isTerminalResponse(idxResponse: IdxResponse) {
  const { neededToProceed, interactionCode } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}

export function getIdxMessages(
  idxResponse: IdxResponse, flow: RemediationFlow
): IdxMessage[] {
  let messages = [];
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
    messages = [...messages, ...fieldMessages];
  }

  return messages;
}

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues,
  options: RunOptions
): Promise<RemediationResponse> {
  const { neededToProceed } = idxResponse;
  const { actions, flow, flowMonitor } = options;
  
  // Try actions in idxResponse first
  if (actions) {
    for (let action of actions) {
      if (typeof idxResponse.actions[action] === 'function') {
        idxResponse = await idxResponse.actions[action]();
        return remediate(idxResponse, values, options); // recursive call
      }
    }
  }

  const remediator = getRemediator(neededToProceed, values, options);
  
  if (!remediator) {
    throw new AuthSdkError(
      'No remediation can match current flow, check policy settings in your org'
    );
  }

  if (flowMonitor.shouldBreak(remediator)) {
    throw new AuthSdkError('Remediation run into loop, break!!!');
  }

  // Recursive loop breaker
  // Return next step to the caller
  if (!remediator.canRemediate()) {
    const nextStep = remediator.getNextStep();
    const canSkip = canSkipFn(idxResponse);
    return { 
      idxResponse, 
      nextStep: { ...nextStep, canSkip },
    };
  }

  const name = remediator.getName();
  const data = remediator.getData();
  try {
    idxResponse = await idxResponse.proceed(name, data);
    
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
      const nextStep = remediator.getNextStep();
      return { nextStep, messages };
    }
    
    // We may want to trim the values bag for the next remediation
    // Let the remediator decide what the values should be (default to current values)
    values = remediator.getValues();
    return remediate(idxResponse, values, options); // recursive call
  } catch (e) {
    // Handle idx messages
    if (isRawIdxResponse(e)) {
      const idxState = idx.makeIdxState(e);
      const terminal = isTerminalResponse(idxState);
      const messages = getIdxMessages(idxState, flow);
      if (terminal) {
        return { terminal, messages };
      } else {
        const nextStep = remediator.getNextStep();
        return { nextStep, messages };
      }
    }
    
    // Thrown error terminates the interaction with idx
    throw e;
  }
}
