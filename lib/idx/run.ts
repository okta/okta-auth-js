/* eslint-disable @typescript-eslint/no-non-null-assertion */
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


/* eslint-disable max-statements, complexity, max-depth */
import { interact } from './interact';
import { introspect } from './introspect';
import { remediate, RemediateOptions } from './remediate';
import { getFlowSpecification, RemediationFlow } from './flow';
import * as remediators from './remediators';
import { 
  OktaAuthInterface,
  IdxStatus,
  IdxTransaction,
  IdxFeature,
  NextStep,
  FlowIdentifier,
  IdxTransactionMeta,
  Tokens,
  APIError,
} from '../types';
import { IdxMessage, IdxResponse, isIdxResponse } from './types/idx-js';
import { getSavedTransactionMeta, saveTransactionMeta } from './transactionMeta';
import { ProceedOptions } from './proceed';
import { getAvailableSteps, getEnabledFeatures, getMessagesFromResponse, isTerminalResponse } from './util';

export type RunOptions = ProceedOptions & RemediateOptions & {
  flow?: FlowIdentifier;
  remediators?: RemediationFlow;
  actions?: string[];
  withCredentials?: boolean;
}

declare interface RunData {
  options: RunOptions;
  values: remediators.RemediationValues;
  status?: IdxStatus;
  tokens?: Tokens;
  nextStep?: NextStep;
  messages?: IdxMessage[];
  error?: APIError | IdxResponse;
  meta?: IdxTransactionMeta;
  enabledFeatures?: IdxFeature[];
  availableSteps?: NextStep[];
  idxResponse?: IdxResponse;
  canceled?: boolean;
  interactionCode?: string;
  shouldClearTransaction?: boolean;
  clearSharedStorage?: boolean;
  terminal?: boolean;
}

function initializeData(authClient, data: RunData): RunData {
  const { options } = data;
  let {
    flow,
    withCredentials,
    remediators,
    actions
  } = options;

  const status = IdxStatus.PENDING;

  // certain options can be set by the flow specification
  flow = flow || authClient.idx.getFlow() || 'default';
  if (flow) {
    authClient.idx.setFlow(flow);
    const flowSpec = getFlowSpecification(authClient, flow);
    // Favor option values over flow spec
    withCredentials = (typeof withCredentials !== 'undefined') ? withCredentials : flowSpec.withCredentials;
    remediators = remediators || flowSpec.remediators;
    actions = actions || flowSpec.actions;
  }
  return { 
    ...data,
    options: { ...options, flow, withCredentials, remediators, actions },
    status
  };
}

async function getDataFromIntrospect(authClient, data: RunData): Promise<RunData> {
  const { options } = data;
  const {
    stateHandle,
    withCredentials,
    version,
    state,
    scopes,
    recoveryToken,
    activationToken
  } = options;

  let idxResponse;
  let meta;

  if (stateHandle) {
    idxResponse = await introspect(authClient, { withCredentials, version, stateHandle });
  } else {
    // Try to resume saved transaction
    meta = getSavedTransactionMeta(authClient, { state, recoveryToken, activationToken });
    let interactionHandle = meta?.interactionHandle; // may be undefined

    if (!interactionHandle) {
      // start a new transaction
      authClient.transactionManager.clear();
      const interactResponse = await interact(authClient, {
        withCredentials,
        state,
        scopes,
        activationToken,
        recoveryToken
      }); 
      interactionHandle = interactResponse.interactionHandle;
      meta = interactResponse.meta;
    }
  
    // Introspect to get idx response
    idxResponse = await introspect(authClient, { withCredentials, version, interactionHandle });
  }
  return { ...data, idxResponse, meta };
}

async function getDataFromRemediate(data: RunData): Promise<RunData> {
  let {
    idxResponse,
    options,
    values
  } = data;

  const {
    autoRemediate,
    remediators,
    actions,
    flow,
    step,
  } = options;
  
  const shouldRemediate = (autoRemediate !== false && (remediators || actions || step));
  if (!shouldRemediate) {
    return data;
  }

  values = { 
    ...values, 
    stateHandle: idxResponse!.rawIdxState.stateHandle 
  };

  // Can we handle the remediations?
  const { 
    idxResponse: idxResponseFromRemediation, 
    nextStep,
    canceled,
  } = await remediate(idxResponse!, values, { remediators, actions, flow, step });
  idxResponse = idxResponseFromRemediation;

  return { ...data, idxResponse, nextStep, canceled };
}

async function getTokens(authClient, data: RunData): Promise<Tokens> {
  let { meta, idxResponse } = data;
  const { interactionCode } = idxResponse as IdxResponse;
  const {
    clientId,
    codeVerifier,
    ignoreSignature,
    redirectUri,
    urls,
    scopes,
  } = meta as IdxTransactionMeta;
  const tokenResponse = await authClient.token.exchangeCodeForTokens({
    interactionCode,
    clientId,
    codeVerifier,
    ignoreSignature,
    redirectUri,
    scopes
  }, urls);
  return tokenResponse.tokens;
}

async function finalizeData(authClient, data: RunData): Promise<RunData> {
  let {
    options,
    idxResponse,
    canceled,
    status,
  } = data;
  const { exchangeCodeForTokens } = options;
  let shouldClearTransaction = false;
  let clearSharedStorage = true;
  let interactionCode;
  let tokens;
  let enabledFeatures;
  let availableSteps;
  let messages;
  let terminal;

  if (idxResponse) {
    enabledFeatures = getEnabledFeatures(idxResponse);
    availableSteps = getAvailableSteps(idxResponse);
    messages = getMessagesFromResponse(idxResponse);
    terminal = isTerminalResponse(idxResponse);
  }

  if (terminal) {
    status = IdxStatus.TERMINAL;
    shouldClearTransaction = true;
    clearSharedStorage = false;
  } else if (canceled) {
    status = IdxStatus.CANCELED;
    shouldClearTransaction = true;
  } else if (idxResponse?.interactionCode) { 
    interactionCode = idxResponse.interactionCode;
    if (exchangeCodeForTokens === false) {
      status = IdxStatus.SUCCESS;
      shouldClearTransaction = false;
    } else {
      tokens = await getTokens(authClient, data);
      status = IdxStatus.SUCCESS;
      shouldClearTransaction = true;
    }
  }
  return {
    ...data,
    status,
    interactionCode,
    tokens,
    shouldClearTransaction,
    clearSharedStorage,
    enabledFeatures,
    availableSteps,
    messages,
    terminal
  };
}

function handleError(err, data: RunData): RunData {
  let { error, status, shouldClearTransaction } = data;

  // current version of idx-js will throw/reject IDX responses. Handle these differently than regular errors
  if (isIdxResponse(err)) {
    error = err;
    status = IdxStatus.FAILURE;
    shouldClearTransaction = true;
  } else {
    // error is not an IDX response, throw it like a regular error
    throw err;
  }

  return { ...data, error, status, shouldClearTransaction };
}

export async function run(
  authClient: OktaAuthInterface, 
  options: RunOptions = {},
): Promise<IdxTransaction> {
  let data: RunData = { options, values: { ...options } };

  data = initializeData(authClient, data);
  try {
    data = await getDataFromIntrospect(authClient, data);
    data = await getDataFromRemediate(data);
  } catch (err) {
    data = handleError(err, data);
  }
  data = await finalizeData(authClient, data);

  const {
    idxResponse,
    meta,
    shouldClearTransaction,
    clearSharedStorage,
    status,
    enabledFeatures,
    availableSteps,
    tokens,
    nextStep,
    messages,
    error,
    interactionCode
  } = data;

  if (idxResponse) {
    // Save intermediate idx response in storage to reduce introspect call
    authClient.transactionManager.saveIdxResponse(idxResponse.rawIdxState);
  }

  if (shouldClearTransaction) {
    authClient.transactionManager.clear({ clearSharedStorage });
  }
  else if (meta?.state) {
    // ensures state is saved to sessionStorage
    saveTransactionMeta(authClient, { ...meta });
  }
  
  // from idx-js, used by the widget
  const { actions, context, neededToProceed, proceed, rawIdxState } = idxResponse || {};
  return {
    status: status!,
    ...(meta && { meta }),
    ...(enabledFeatures && { enabledFeatures }),
    ...(availableSteps && { availableSteps }),
    ...(tokens && { tokens }),
    ...(nextStep && { nextStep }),
    ...(messages && messages.length && { messages }),
    ...(error && { error }),
    interactionCode, // if options.exchangeCodeForTokens is false

    // from idx-js
    actions: actions!,
    context: context!,
    neededToProceed: neededToProceed!,
    proceed: proceed!,
    rawIdxState: rawIdxState!,
  };
}
