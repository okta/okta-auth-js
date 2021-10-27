import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
import { remediate } from './remediate';
import * as remediators from './remediators';
import { AuthSdkError } from '../errors';
import { IdxStatus, IdxFeature } from '../types';

function getEnabledFeatures(idxResponse) {
  var res = [];
  var {
    actions,
    neededToProceed
  } = idxResponse;

  if (actions['currentAuthenticator-recover']) {
    res.push(IdxFeature.PASSWORD_RECOVERY);
  }

  if (neededToProceed.some(_ref => {
    var {
      name
    } = _ref;
    return name === 'select-enroll-profile';
  })) {
    res.push(IdxFeature.REGISTRATION);
  }

  if (neededToProceed.some(_ref2 => {
    var {
      name
    } = _ref2;
    return name === 'redirect-idp';
  })) {
    res.push(IdxFeature.SOCIAL_IDP);
  }

  return res;
}

function getAvailableSteps(remediations) {
  var res = [];
  var remediatorMap = Object.values(remediators).reduce((map, remediatorClass) => {
    // Only add concrete subclasses to the map
    if (remediatorClass.remediationName) {
      map[remediatorClass.remediationName] = remediatorClass;
    }

    return map;
  }, {});

  for (var remediation of remediations) {
    var T = remediatorMap[remediation.name];

    if (T) {
      var remediator = new T(remediation);
      res.push(remediator.getNextStep());
    }
  }

  return res;
}

export function run(_x, _x2) {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(function* (authClient, options) {
    var tokens;
    var nextStep;
    var messages;
    var error;
    var meta;
    var enabledFeatures;
    var availableSteps;
    var status = IdxStatus.PENDING;
    var shouldClearTransaction = false;

    try {
      // Start/resume the flow
      var {
        interactionHandle,
        meta: metaFromResp
      } = yield interact(authClient, options); // Introspect to get idx response

      var idxResponse = yield introspect(authClient, {
        interactionHandle
      });

      if (!options.flow && !options.actions) {
        // handle start transaction
        meta = metaFromResp;
        enabledFeatures = getEnabledFeatures(idxResponse);
        availableSteps = getAvailableSteps(idxResponse.neededToProceed);
      } else {
        var values = _objectSpread(_objectSpread({}, options), {}, {
          stateHandle: idxResponse.rawIdxState.stateHandle
        }); // Can we handle the remediations?


        var {
          idxResponse: idxResponseFromResp,
          nextStep: nextStepFromResp,
          terminal,
          canceled,
          messages: messagesFromResp
        } = yield remediate(idxResponse, values, options); // Track fields from remediation response

        nextStep = nextStepFromResp;
        messages = messagesFromResp; // Save intermediate idx response in storage to reduce introspect call

        if (nextStep && idxResponseFromResp) {
          authClient.transactionManager.saveIdxResponse(idxResponseFromResp.rawIdxState);
        }

        if (terminal) {
          status = IdxStatus.TERMINAL;
          shouldClearTransaction = true;
        }

        if (canceled) {
          status = IdxStatus.CANCELED;
          shouldClearTransaction = true;
        } else if (idxResponseFromResp !== null && idxResponseFromResp !== void 0 && idxResponseFromResp.interactionCode) {
          // Flows may end with interactionCode before the key remediation being hit
          // Double check if flow is finished to mitigate confusion with the wrapper methods
          if (!(yield options.flowMonitor.isFinished())) {
            throw new AuthSdkError('Current flow is not supported, check policy settings in your org.');
          }

          var {
            clientId,
            codeVerifier,
            ignoreSignature,
            redirectUri,
            urls,
            scopes
          } = metaFromResp;
          tokens = yield authClient.token.exchangeCodeForTokens({
            interactionCode: idxResponseFromResp.interactionCode,
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
    } catch (err) {
      error = err;
      status = IdxStatus.FAILURE;
      shouldClearTransaction = true;
    }

    if (shouldClearTransaction) {
      authClient.transactionManager.clear();
    }

    return _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
      status
    }, meta && {
      meta
    }), enabledFeatures && {
      enabledFeatures
    }), availableSteps && {
      availableSteps
    }), tokens && {
      tokens: tokens.tokens
    }), nextStep && {
      nextStep
    }), messages && {
      messages
    }), error && {
      error
    });
  });
  return _run.apply(this, arguments);
}
//# sourceMappingURL=run.js.map