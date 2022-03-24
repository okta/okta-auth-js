import { warn } from '../util';
import * as remediators from './remediators';
import { RemediationValues, Remediator, RemediatorConstructor } from './remediators';
import { IdxFeature, NextStep, RemediateOptions, RemediationResponse } from './types';
import { IdxMessage, IdxRemediation, IdxRemediationValue, IdxResponse, isIdxResponse } from './types/idx-js';

export function isTerminalResponse(idxResponse: IdxResponse) {
  const { neededToProceed, interactionCode } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}

export function canSkipFn(idxResponse: IdxResponse) {
  return idxResponse.neededToProceed.some(({ name }) => name === 'skip');
}

export function canResendFn(idxResponse: IdxResponse) {
  return Object.keys(idxResponse.actions).some(actionName => actionName.includes('resend'));
}

export function getMessagesFromIdxRemediationValue(
  value?: IdxRemediationValue[]
): IdxMessage[] | undefined {
  if (!value || !Array.isArray(value)) {
    return;
  }
  return value.reduce((messages, value) => {
    if (value.messages) {
      messages = [...messages, ...value.messages.value] as never;
    }
    if (value.form) {
      const messagesFromForm = getMessagesFromIdxRemediationValue(value.form.value) || [];
      messages = [...messages, ...messagesFromForm] as never;
    } 
    if (value.options) {
      let optionValues = [];
      value.options.forEach(option => {
        if (!option.value || typeof option.value === 'string') {
          return;
        }
        optionValues = [...optionValues, option.value] as never;
      });
      const messagesFromOptions = getMessagesFromIdxRemediationValue(optionValues) || [];
      messages = [...messages, ...messagesFromOptions] as never;
    }
    return messages;
  }, []);
}

export function getMessagesFromResponse(idxResponse: IdxResponse): IdxMessage[] {
  let messages: IdxMessage[] = [];
  const { rawIdxState, neededToProceed } = idxResponse;

  // Handle global messages
  const globalMessages = rawIdxState.messages?.value.map(message => message);
  if (globalMessages) {
    messages = [...messages, ...globalMessages] as never;
  }

  // Handle field messages for current flow
  for (let remediation of neededToProceed) {
    const fieldMessages = getMessagesFromIdxRemediationValue(remediation.value);
    if (fieldMessages) {
      messages = [...messages, ...fieldMessages] as never;
    }
  }

  // API may return identical error on same field, filter by i18n key
  const seen = {};
  messages = messages.reduce((filtered, message) => {
    const key = message.i18n?.key;
    if (key && seen[key]) {
      return filtered;
    }
    seen[key] = message;
    filtered = [...filtered, message] as never;
    return filtered;
  }, []);
  return messages;
}


export function getEnabledFeatures(idxResponse: IdxResponse): IdxFeature[] {
  const res = [];
  const { actions, neededToProceed } = idxResponse;

  if (actions['currentAuthenticator-recover']) {
    res.push(IdxFeature.PASSWORD_RECOVERY as never);
  }

  if (neededToProceed.some(({ name }) => name === 'select-enroll-profile')) {
    res.push(IdxFeature.REGISTRATION as never);
  }

  if (neededToProceed.some(({ name }) => name === 'redirect-idp')) {
    res.push(IdxFeature.SOCIAL_IDP as never);
  }

  if (neededToProceed.some(({ name }) => name === 'unlock-account')) {
    res.push(IdxFeature.ACCOUNT_UNLOCK as never);
  }

  return res;
}

export function getAvailableSteps(idxResponse: IdxResponse): NextStep[] {
  const res: NextStep[] = [];

  const remediatorMap: Record<string, RemediatorConstructor> = Object.values(remediators)
    .reduce((map, remediatorClass) => {
      // Only add concrete subclasses to the map
      if (remediatorClass.remediationName) {
        map[remediatorClass.remediationName] = remediatorClass;
      }
      return map;
    }, {});

  for (let remediation of idxResponse.neededToProceed) {
    const T = remediatorMap[remediation.name];
    if (T) {
      const remediator: Remediator = new T(remediation);
      res.push (remediator.getNextStep(idxResponse.context) as never);
    }
  }

  return res;
}

export function filterValuesForRemediation(
  idxResponse: IdxResponse,
  remediationName: string,
  values: RemediationValues
): RemediationValues {
  const remediations = idxResponse.neededToProceed || [];
  const remediation = remediations.find(r => r.name === remediationName);
  if (!remediation) {
    // step was specified, but remediation was not found. This is unexpected!
    warn(`filterValuesForRemediation: "${remediationName}" did not match any remediations`);
    return values;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const valuesForRemediation = remediation.value!.reduce((res, entry) => {
    const { name, value } = entry;
    if (name === 'stateHandle') {
      res[name] = value; // use the stateHandle value in the remediation
    } else {
      res[name] = values[name]; // use the value provided by the caller
    }
    return res;
  }, {});
  return valuesForRemediation;
}

// Return first match idxRemediation in allowed remediators
// eslint-disable-next-line complexity
export function getRemediator(
  idxRemediations: IdxRemediation[],
  values: RemediationValues,
  options: RemediateOptions,
): Remediator | undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const remediators = options.remediators!;

  let remediator: Remediator;
  // remediation name specified by caller - fast-track remediator lookup 
  if (options.step) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediation = idxRemediations.find(({ name }) => name === options.step)!;
    if (remediation) {
      const T = remediation ? remediators[remediation.name] : undefined;
      return T ? new T(remediation, values, options) : undefined;
    } else {
      // step was specified, but remediation was not found. This is unexpected!
      warn(`step "${options.step}" did not match any remediations`);
      return;
    }
  }

  const remediatorCandidates: Remediator[] = [];
  for (let remediation of idxRemediations) {
    const isRemeditionInFlow = Object.keys(remediators as object).includes(remediation.name);
    if (!isRemeditionInFlow) {
      continue;
    }

    const T = remediators[remediation.name];
    remediator = new T(remediation, values, options);
    if (remediator.canRemediate()) {
      // found the remediator
      return remediator;
    }
    // remediator cannot handle the current values
    // maybe return for next step
    remediatorCandidates.push(remediator);  
  }
  
  return remediatorCandidates[0];
}


export function getNextStep(
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

export function handleIdxError(e, remediator?): RemediationResponse {
  // Handle idx messages
  let idxResponse = isIdxResponse(e) ? e : null;
  if (!idxResponse) {
    // Thrown error terminates the interaction with idx
    throw e;
  }
  idxResponse = {
    ...idxResponse,
    requestDidSucceed: false
  };
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
