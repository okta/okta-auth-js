import * as remediators from './remediators';
import { RemediationValues } from './remediators';
import { IdxFeature, NextStep } from './types';
import { IdxMessage, IdxRemediationValue, IdxResponse } from './types/idx-js';

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
  const res = [];

  const remediatorMap = Object.values(remediators).reduce((map, remediatorClass) => {
    // Only add concrete subclasses to the map
    if (remediatorClass.remediationName) {
      map[remediatorClass.remediationName] = remediatorClass;
    }
    return map;
  }, {});

  for (let remediation of idxResponse.neededToProceed) {
    const T = remediatorMap[remediation.name];
    if (T) {
      const remediator = new T(remediation);
      res.push (remediator.getNextStep(idxResponse.context) as never);
    }
  }

  return res;
}

export function filterValuesForRemediation(idxResponse: IdxResponse, values: RemediationValues): RemediationValues {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const valuesForRemediation = idxResponse.neededToProceed![0]!.value!.reduce((res, entry) => {
    const { name } = entry;
    res[name] = values[name];
    return res;
  }, {});
  return valuesForRemediation;
}
