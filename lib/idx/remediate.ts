/* eslint-disable max-statements */
/* eslint-disable complexity */
import idx from '@okta/okta-idx-js';
import { AuthSdkError } from '../errors';
import { Base as Remeditor } from './remediators';
import { RunOptions } from './run';
import LoopMonitor from './RemediationLoopMonitor';
import { 
  IdxResponse, 
  isRawIdxResponse, 
  RemediationFlow, 
  RemediationValues,
  APIError,
  NextStep,
  IdxRemediation,
} from '../types';
import { 
  createApiError,
  canSkip as canSkipFn,
} from './util';

interface RemediationResponse {
  idxResponse?: IdxResponse;
  nextStep?: NextStep;
  canSkip?: boolean;
  formError?: APIError;
  terminal?: {
    messages: string[];
  };
}

// Return first match idxRemediation in allowed remediators
export function getRemeditor(
  flow: RemediationFlow, 
  allowedNextSteps: string[],
  idxRemediations: IdxRemediation[],
  values: RemediationValues,
): Remeditor {
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
    } else {
      // remediator cannot handle the current values
      // maybe return for next step
      remediatorCandidates.push(remediator);
    }
  }

  // Return first remediatorCandidate in the allowed nextSteps
  for (let remediatorCandidate of remediatorCandidates) {
    const name = remediatorCandidate.getName();
    if (allowedNextSteps.includes(name)) {
      return remediatorCandidate;
    }
  }

  return null;
}

function isTerminalResponse(idxResponse: IdxResponse) {
  const { neededToProceed, interactionCode } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}

export function getTerminalMessages(idxResponse: IdxResponse) {
  if (!isTerminalResponse(idxResponse)) {
    return null;
  }

  const { rawIdxState } = idxResponse;
  return rawIdxState.messages.value.map(({ message }) => message);
}

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues,
  loopMonitor: LoopMonitor,
  options: RunOptions
): Promise<RemediationResponse> {
  const { neededToProceed } = idxResponse;
  const { actions, flow, allowedNextSteps } = options;
  
  // Try actions in idxResponse first
  if (actions) {
    for (let action of actions) {
      if (typeof idxResponse.actions[action] === 'function') {
        idxResponse = await idxResponse.actions[action]();
        return remediate(idxResponse, values, loopMonitor, options); // recursive call
      }
    }
  }

  const remediator = getRemeditor(flow, allowedNextSteps, neededToProceed, values);
  
  if (!remediator) {
    throw new AuthSdkError(
      'No remediation can match current flow, check policy settings in your org'
    );
  }

  if (loopMonitor.shouldBreak(remediator)) {
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
    const terminalMessages = getTerminalMessages(idxResponse);
    if (terminalMessages) {
      return { terminal: { messages: terminalMessages } };
    }
    
    // We may want to trim the values bag for the next remediation
    // Let the remeditor decide what the values should be (default to current values)
    values = remediator.getValues();
    return remediate(idxResponse, values, loopMonitor, options); // recursive call
  } catch (e) {
    // Handle form error
    if (isRawIdxResponse(e)) {
      const idxState = idx.makeIdxState(e);
      const terminalMessages = getTerminalMessages(idxState);
      if (terminalMessages) {
        return { terminal: { messages: terminalMessages } };
      } else {
        // Treat both global errors and field errors as form error
        const nextStep = remediator.getNextStep();
        const formError = e.messages 
          ? createApiError(e) 
          : remediator.createFormError(e);
        return { nextStep, formError };
      }
    }
    
    // Thrown error terminates the interaction with idx
    throw e;
  }
}
