"use strict";

exports.run = run;

var _interact = require("./interact");

var _introspect = require("./introspect");

var _remediate = require("./remediate");

var remediators = _interopRequireWildcard(require("./remediators"));

var _errors = require("../errors");

var _types = require("../types");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
function getEnabledFeatures(idxResponse) {
  const res = [];
  const {
    actions,
    neededToProceed
  } = idxResponse;

  if (actions['currentAuthenticator-recover']) {
    res.push(_types.IdxFeature.PASSWORD_RECOVERY);
  }

  if (neededToProceed.some(({
    name
  }) => name === 'select-enroll-profile')) {
    res.push(_types.IdxFeature.REGISTRATION);
  }

  if (neededToProceed.some(({
    name
  }) => name === 'redirect-idp')) {
    res.push(_types.IdxFeature.SOCIAL_IDP);
  }

  return res;
}

function getAvailableSteps(remediations) {
  const res = [];
  const remediatorMap = Object.values(remediators).reduce((map, remediatorClass) => {
    // Only add concrete subclasses to the map
    if (remediatorClass.remediationName) {
      map[remediatorClass.remediationName] = remediatorClass;
    }

    return map;
  }, {});

  for (let remediation of remediations) {
    const T = remediatorMap[remediation.name];

    if (T) {
      const remediator = new T(remediation);
      res.push(remediator.getNextStep());
    }
  }

  return res;
}

async function run(authClient, options) {
  let tokens;
  let nextStep;
  let messages;
  let error;
  let meta;
  let enabledFeatures;
  let availableSteps;
  let status = _types.IdxStatus.PENDING;
  let shouldClearTransaction = false;

  try {
    // Start/resume the flow
    const {
      interactionHandle,
      meta: metaFromResp
    } = await (0, _interact.interact)(authClient, options); // Introspect to get idx response

    const idxResponse = await (0, _introspect.introspect)(authClient, {
      interactionHandle
    });

    if (!options.flow && !options.actions) {
      // handle start transaction
      meta = metaFromResp;
      enabledFeatures = getEnabledFeatures(idxResponse);
      availableSteps = getAvailableSteps(idxResponse.neededToProceed);
    } else {
      const values = { ...options,
        stateHandle: idxResponse.rawIdxState.stateHandle
      }; // Can we handle the remediations?

      const {
        idxResponse: idxResponseFromResp,
        nextStep: nextStepFromResp,
        terminal,
        canceled,
        messages: messagesFromResp
      } = await (0, _remediate.remediate)(idxResponse, values, options); // Track fields from remediation response

      nextStep = nextStepFromResp;
      messages = messagesFromResp; // Save intermediate idx response in storage to reduce introspect call

      if (nextStep && idxResponseFromResp) {
        authClient.transactionManager.saveIdxResponse(idxResponseFromResp.rawIdxState);
      }

      if (terminal) {
        status = _types.IdxStatus.TERMINAL;
        shouldClearTransaction = true;
      }

      if (canceled) {
        status = _types.IdxStatus.CANCELED;
        shouldClearTransaction = true;
      } else if (idxResponseFromResp !== null && idxResponseFromResp !== void 0 && idxResponseFromResp.interactionCode) {
        // Flows may end with interactionCode before the key remediation being hit
        // Double check if flow is finished to mitigate confusion with the wrapper methods
        if (!(await options.flowMonitor.isFinished())) {
          throw new _errors.AuthSdkError('Current flow is not supported, check policy settings in your org.');
        }

        const {
          clientId,
          codeVerifier,
          ignoreSignature,
          redirectUri,
          urls,
          scopes
        } = metaFromResp;
        tokens = await authClient.token.exchangeCodeForTokens({
          interactionCode: idxResponseFromResp.interactionCode,
          clientId,
          codeVerifier,
          ignoreSignature,
          redirectUri,
          scopes
        }, urls);
        status = _types.IdxStatus.SUCCESS;
        shouldClearTransaction = true;
      }
    }
  } catch (err) {
    error = err;
    status = _types.IdxStatus.FAILURE;
    shouldClearTransaction = true;
  }

  if (shouldClearTransaction) {
    authClient.transactionManager.clear();
  }

  return {
    status,
    ...(meta && {
      meta
    }),
    ...(enabledFeatures && {
      enabledFeatures
    }),
    ...(availableSteps && {
      availableSteps
    }),
    ...(tokens && {
      tokens: tokens.tokens
    }),
    ...(nextStep && {
      nextStep
    }),
    ...(messages && {
      messages
    }),
    ...(error && {
      error
    })
  };
}
//# sourceMappingURL=run.js.map