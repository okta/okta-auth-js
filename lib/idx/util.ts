import { warn, split2 } from '../util';
import { RemediationValues, Remediator, RemediatorConstructor } from './remediators';
import { GenericRemediator } from './remediators/GenericRemediator';
import {
  OktaAuthIdxInterface,
  IdxFeature,
  NextStep,
  RemediateOptions,
  RemediationResponse,
  RunOptions,
  FlowIdentifier,
  FlowSpecification
} from './types';
import { IdxMessage, IdxRemediation, IdxRemediationValue, IdxResponse } from './types/idx-js';

type GetFlowSpecification = (
  oktaAuth: OktaAuthIdxInterface,
  flow: FlowIdentifier
) => FlowSpecification;

const ctx: {
  remediators: Record<string, RemediatorConstructor>,
  getFlowSpecification: GetFlowSpecification,
} = {
  // default values to be used by minimal IDX API
  remediators: {},
  getFlowSpecification: function(_oktaAuth: OktaAuthIdxInterface, _flow: FlowIdentifier = 'default') {
    return {
      remediators: {}
    } as FlowSpecification;
  }
};

// should be set in createIdxAPI() factory
export function setRemediatorsCtx(newCtx: Partial<typeof ctx>) {
  Object.assign(ctx, newCtx);
}

export function getFlowSpecification(oktaAuth: OktaAuthIdxInterface, flow: FlowIdentifier = 'default') {
  return ctx.getFlowSpecification(oktaAuth, flow);
}

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

export function getMessagesFromResponse(idxResponse: IdxResponse, options: RunOptions): IdxMessage[] {
  let messages: IdxMessage[] = [];
  const { rawIdxState, neededToProceed } = idxResponse;

  // Handle global messages
  const globalMessages = rawIdxState.messages?.value.map(message => message);
  if (globalMessages) {
    messages = [...messages, ...globalMessages] as never;
  }

  // Handle field messages for current flow
  // Preserve existing logic for general cases, remove in the next major version
  // Follow ion response format for top level messages when useGenericRemediator is true
  if (!options.useGenericRemediator) {
    for (let remediation of neededToProceed) {
      const fieldMessages = getMessagesFromIdxRemediationValue(remediation.value);
      if (fieldMessages) {
        messages = [...messages, ...fieldMessages] as never;
      }
    }
  }

  // API may return identical error on same field, filter by i18n key
  const seen = {};
  messages = messages.reduce((filtered, message) => {
    const key = message.i18n?.key;
    if (key && seen[key] && message.message === seen[key].message) {
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

export function getAvailableSteps(
  authClient: OktaAuthIdxInterface, 
  idxResponse: IdxResponse, 
  useGenericRemediator?: boolean
): NextStep[] {
  const res: NextStep[] = [];

  const remediatorMap: Record<string, RemediatorConstructor> = Object.values(ctx.remediators)
    .reduce((map, remediatorClass) => {
      // Only add concrete subclasses to the map
      if (remediatorClass.remediationName) {
        map[remediatorClass.remediationName] = remediatorClass;
      }
      return map;
    }, {});

  for (let remediation of idxResponse.neededToProceed) {
    const T = getRemediatorClass(remediation, { useGenericRemediator, remediators: remediatorMap });
    if (T) {
      const remediator: Remediator = new T(remediation);
      res.push (remediator.getNextStep(authClient, idxResponse.context) as never);
    }
  }

  for (const [name] of Object.entries((idxResponse.actions || {}))) {
    let stepObj = {
      name, 
      action: async (params?) => {
        return authClient.idx.proceed({ 
          actions: [{ name, params }] 
        });
      }
    };
    if (name.startsWith('currentAuthenticator')) {
      const [part1, part2] = split2(name, '-');
      const actionObj = idxResponse.rawIdxState[part1].value[part2];
      /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
      const {
        href, 
        method, 
        rel, 
        accepts, 
        produces, 
        ...rest
      } = actionObj;
      /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */
      const value = actionObj.value?.filter(item => item.name !== 'stateHandle');
      stepObj = { 
        ...rest,  
        ...(value && { value }),
        ...stepObj,
      };
    }
    res.push(stepObj);
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

function getRemediatorClass(remediation: IdxRemediation, options: RemediateOptions) {
  const { useGenericRemediator, remediators } = options;
  
  if (!remediation) {
    return undefined;
  }

  if (useGenericRemediator) {
    return GenericRemediator;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return remediators![remediation.name];
}

// Return first match idxRemediation in allowed remediators
// eslint-disable-next-line complexity
export function getRemediator(
  idxResponse: IdxResponse,
  values: RemediationValues,
  options: RemediateOptions,
): Remediator | undefined {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const remediators = options.remediators!;
  const useGenericRemediator = options.useGenericRemediator;
  const {neededToProceed: idxRemediations, context} = idxResponse;

  let remediator: Remediator;
  // remediation name specified by caller - fast-track remediator lookup 
  if (options.step) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediation = idxRemediations.find(({ name }) => name === options.step)!;
    if (remediation) {
      const T = getRemediatorClass(remediation, options);
      return T ? new T(remediation, values, options) : undefined;
    } else {
      // step was specified, but remediation was not found. This is unexpected!
      warn(`step "${options.step}" did not match any remediations`);
      return;
    }
  }

  const remediatorCandidates: Remediator[] = [];
  if (useGenericRemediator) {
    // always pick the first remediation for when use GenericRemediator
    remediatorCandidates.push(new GenericRemediator(idxRemediations[0], values, options));
  } else {
    for (let remediation of idxRemediations) {
      const isRemeditionInFlow = Object.keys(remediators as object).includes(remediation.name);
      if (!isRemeditionInFlow) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const T = getRemediatorClass(remediation, options)!;
      remediator = new T(remediation, values, options);
      if (remediator.canRemediate(context)) {
        // found the remediator
        return remediator;
      }
      // remediator cannot handle the current values
      // maybe return for next step
      remediatorCandidates.push(remediator);  
    }
  }
  
  return remediatorCandidates[0];
}


export function getNextStep(
  authClient: OktaAuthIdxInterface, remediator: Remediator, idxResponse: IdxResponse
): NextStep {
  const nextStep = remediator.getNextStep(authClient, idxResponse.context);
  const canSkip = canSkipFn(idxResponse);
  const canResend = canResendFn(idxResponse);
  return {
    ...nextStep,
    ...(canSkip && {canSkip}),
    ...(canResend && {canResend}),
  };
}

export function handleFailedResponse(
  authClient: OktaAuthIdxInterface,
  idxResponse: IdxResponse,
  options = {}
): RemediationResponse {
  const terminal = isTerminalResponse(idxResponse);
  const messages = getMessagesFromResponse(idxResponse, options);
  if (terminal) {
    return { idxResponse, terminal, messages };
  } else {
    const remediator = getRemediator(idxResponse, {}, options);
    const nextStep = remediator && getNextStep(authClient, remediator, idxResponse);
    return {
      idxResponse,
      messages,
      ...(nextStep && { nextStep }),
    };
  }
  
}
