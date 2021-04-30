/* eslint-disable max-statements */
/* eslint-disable complexity */
import { AuthSdkError } from '../errors';
import { Base as Remeditor } from './remediators';
import { RunOptions } from './run';
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
  isErrorResponse,
  canSkip as canSkipFn,
} from './util';

interface RemediationResponse {
  idxResponse?: IdxResponse;
  nextStep?: NextStep;
  canSkip?: boolean;
  formError?: APIError;
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

// This function is called recursively until it reaches success or cannot be remediated
export async function remediate(
  idxResponse: IdxResponse,
  values: RemediationValues,
  options: RunOptions
): Promise<RemediationResponse> {
  const { neededToProceed } = idxResponse;
  const { actions, flow, allowedNextSteps } = options;
  
  // Try actions in idxResponse first
  if (actions) {
    for (let action of actions) {
      if (typeof idxResponse.actions[action] === 'function') {
        idxResponse = await idxResponse.actions[action]();
        return remediate(idxResponse, values, options); // recursive call
      }
    }
  }

  const remediator = getRemeditor(flow, allowedNextSteps, neededToProceed, values);
  
  if (!remediator) {
    throw new AuthSdkError(
      'No remediation can match current flow, check policy settings in your org'
    );
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
    if (isErrorResponse(idxResponse)) {
      throw createApiError(idxResponse.rawIdxState);
    }
    if (idxResponse.interactionCode) {
      return { idxResponse };
    }
    // We may want to trim the values bag for the next remediation
    // Let the remeditor decide what the values should be (default to current values)
    values = remediator.getValues();
    return remediate(idxResponse, values, options); // recursive call
  } catch (e) {
    // Thrown error terminates the interaction with idx
    if (isRawIdxResponse(e)) { // idx responses are sometimes thrown, these will be "raw"
      if (e.messages) {
        // Error in the root level of the response is not handlable, throw it
        throw createApiError(e);
      } else {
        // Form error is handlable with client side retry, return it
        const nextStep = remediator.getNextStep();
        const formError = remediator.createFormError(e);
        return { nextStep, formError };
      }
    }
    // throw unknown error
    throw e;
  }
}
