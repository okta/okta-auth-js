import * as remediators from './remediators';
import { IdxFeature, NextStep } from './types';
import { IdxMessage, IdxRemediation, IdxResponse } from './types/idx-js';

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

export function getMessagesFromRemediation(remediation: IdxRemediation): IdxMessage[] | undefined {
  if (!remediation.value) {
    return;
  }
  return remediation.value[0]?.form?.value.reduce((messages, field) => {
    if (field.messages) {
      messages = [...messages, ...field.messages.value] as never;
    }
    return messages;
  }, []);
}

export function getMessagesFromResponse(idxResponse: IdxResponse): IdxMessage[] {
  let messages = [];
  const { rawIdxState, neededToProceed } = idxResponse;

  // Handle global messages
  const globalMessages = rawIdxState.messages?.value.map(message => message);
  if (globalMessages) {
    messages = [...messages, ...globalMessages] as never;
  }

  // Handle field messages for current flow
  for (let remediation of neededToProceed) {
    const fieldMessages = getMessagesFromRemediation(remediation);
    if (fieldMessages) {
      messages = [...messages, ...fieldMessages] as never;
    }
  }

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
