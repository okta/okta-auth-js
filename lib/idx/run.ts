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
  OktaAuth,
  IdxStatus,
  IdxTransaction,
  IdxFeature,
  NextStep,
  FlowIdentifier,
} from '../types';
import { IdxResponse, isIdxResponse } from './types/idx-js';
import { getSavedTransactionMeta } from './transactionMeta';
import { ProceedOptions } from './proceed';

export type RunOptions = ProceedOptions & RemediateOptions & {
  flow?: FlowIdentifier;
  remediators?: RemediationFlow;
  actions?: string[];
  withCredentials?: boolean;
}

function getEnabledFeatures(idxResponse: IdxResponse): IdxFeature[] {
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

  return res;
}

function getAvailableSteps(idxResponse: IdxResponse): NextStep[] {
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

export async function run(
  authClient: OktaAuth, 
  options: RunOptions = {},
): Promise<IdxTransaction> {
  let tokens;
  let nextStep;
  let messages;
  let error;
  let meta;
  let enabledFeatures;
  let availableSteps;
  let status = IdxStatus.PENDING;
  let shouldClearTransaction = false;
  let clearSharedStorage = true;
  let idxResponse;
  let interactionHandle;
  let metaFromResp;
  let interactionCode;

  try {

    let {
      flow,
      state,
      scopes,
      version,
      remediators,
      actions,
      withCredentials,
      exchangeCodeForTokens,
      autoRemediate,
      step
    } = options;

    // Only one flow can be operating at a time
    flow = flow || authClient.idx.getFlow() || 'default';
    if (flow) {
      authClient.idx.setFlow(flow);
      const flowSpec = getFlowSpecification(authClient, flow);
      // Favor option values over flow spec
      withCredentials = (typeof withCredentials !== 'undefined') ? withCredentials : flowSpec.withCredentials;
      remediators = remediators || flowSpec.remediators;
      actions = actions || flowSpec.actions;
    }

    // Try to resume saved transaction
    metaFromResp = getSavedTransactionMeta(authClient, { state });
    interactionHandle = metaFromResp?.interactionHandle; // may be undefined

    if (!interactionHandle) {
      // start a new transaction
      authClient.transactionManager.clear();
      const interactResponse = await interact(authClient, { withCredentials, state, scopes }); 
      interactionHandle = interactResponse.interactionHandle;
      metaFromResp = interactResponse.meta;
      withCredentials = metaFromResp.withCredentials;
    }

    // Introspect to get idx response
    idxResponse = await introspect(authClient, { withCredentials, version, interactionHandle });
    enabledFeatures = getEnabledFeatures(idxResponse);
    availableSteps = getAvailableSteps(idxResponse);
    
    // Include meta in the transaction response
    meta = metaFromResp;

    if (autoRemediate !== false && (remediators || actions)) {
      const values: remediators.RemediationValues = { 
        ...options, 
        stateHandle: idxResponse.rawIdxState.stateHandle 
      };

      // Can we handle the remediations?
      const { 
        idxResponse: idxResponseFromResp, 
        nextStep: nextStepFromResp,
        terminal,
        canceled,
        messages: messagesFromResp,
      } = await remediate(idxResponse, values, { remediators, actions, flow, step });
      idxResponse = idxResponseFromResp || idxResponse;

      // Track fields from remediation response
      nextStep = nextStepFromResp;
      messages = messagesFromResp;

      // Save intermediate idx response in storage to reduce introspect call
      if (nextStep) {
        authClient.transactionManager.saveIdxResponse(idxResponse.rawIdxState);
        availableSteps = getAvailableSteps(idxResponse);
      }

      if (terminal) {
        status = IdxStatus.TERMINAL;
        shouldClearTransaction = true;
        clearSharedStorage = false; // transaction may be continued in another tab
      } if (canceled) {
        status = IdxStatus.CANCELED;
        shouldClearTransaction = true;
      } else if (idxResponse?.interactionCode) { 
        interactionCode = idxResponse.interactionCode;

        if (exchangeCodeForTokens === false) {
          status = IdxStatus.SUCCESS;
          shouldClearTransaction = false;
        } else {
          // exchange the interaction code for tokens
          const {
            clientId,
            codeVerifier,
            ignoreSignature,
            redirectUri,
            urls,
            scopes,
          } = metaFromResp;
          tokens = await authClient.token.exchangeCodeForTokens({
            interactionCode,
            clientId,
            codeVerifier,
            ignoreSignature,
            redirectUri,
            scopes
          }, urls);

          status = IdxStatus.SUCCESS;
          shouldClearTransaction = true;
        }
      }
    }
  } catch (err) {
    // current version of idx-js will throw/reject IDX responses. Handle these differently than regular errors
    if (isIdxResponse(err)) {
      error = err;
      status = IdxStatus.FAILURE;
      shouldClearTransaction = true;
    } else {
      // error is not an IDX response, throw it like a regular error
      throw err;
    }

  }

  if (shouldClearTransaction) {
    authClient.transactionManager.clear({ clearSharedStorage });
  }
  
  // from idx-js, used by the widget
  const { actions, context, neededToProceed, proceed, rawIdxState } = idxResponse || {};
  return {
    status,
    ...(meta && { meta }),
    ...(enabledFeatures && { enabledFeatures }),
    ...(availableSteps && { availableSteps }),
    ...(tokens && { tokens: tokens.tokens }),
    ...(nextStep && { nextStep }),
    ...(messages && { messages }),
    ...(error && { error }),
    interactionCode, // if options.exchangeCodeForTokens is false

    // from idx-js
    actions,
    context,
    neededToProceed,
    proceed,
    rawIdxState,
  };
}
