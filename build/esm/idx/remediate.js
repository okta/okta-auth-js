import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

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

/* eslint-disable max-statements, max-depth, complexity */
import idx from '@okta/okta-idx-js';
import { AuthSdkError } from '../errors';
import { isRawIdxResponse } from './types/idx-js';
var actionsTriggeredByValues = {
  resend: 'currentAuthenticatorEnrollment-resend' // assuming only one '-resend' action is present in response

};
// Return first match idxRemediation in allowed remediators
export function getRemediator(idxRemediations, values, options) {
  var {
    flow,
    flowMonitor
  } = options;
  var remediator;
  var remediatorCandidates = [];

  for (var remediation of idxRemediations) {
    var isRemeditionInFlow = Object.keys(flow).includes(remediation.name);

    if (!isRemeditionInFlow) {
      continue;
    }

    var T = flow[remediation.name];
    remediator = new T(remediation, values);

    if (flowMonitor.isRemediatorCandidate(remediator, idxRemediations, values)) {
      if (remediator.canRemediate()) {
        // found the remediator
        return remediator;
      } // remediator cannot handle the current values
      // maybe return for next step


      remediatorCandidates.push(remediator);
    }
  } // TODO: why is it a problem to have multiple remediations? 
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-400758
  // if (remediatorCandidates.length > 1) {
  //   const remediationNames = remediatorCandidates.reduce((acc, curr) => {
  //     const name = curr.getName();
  //     return acc ? `${acc}, ${name}` : name;
  //   }, '');
  //   throw new AuthSdkError(`
  //     More than one remediation can match the current input, remediations: ${remediationNames}
  //   `);
  // }


  return remediatorCandidates[0];
}

function isTerminalResponse(idxResponse) {
  var {
    neededToProceed,
    interactionCode
  } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}

function canSkipFn(idxResponse) {
  return idxResponse.neededToProceed.some(_ref => {
    var {
      name
    } = _ref;
    return name === 'skip';
  });
}

function canResendFn(idxResponse) {
  return Object.keys(idxResponse.actions).some(actionName => actionName.includes('resend'));
}

function getIdxMessages(idxResponse, flow) {
  var _rawIdxState$messages;

  var messages = [];
  var {
    rawIdxState,
    neededToProceed
  } = idxResponse; // Handle global messages

  var globalMessages = (_rawIdxState$messages = rawIdxState.messages) === null || _rawIdxState$messages === void 0 ? void 0 : _rawIdxState$messages.value.map(message => message);

  if (globalMessages) {
    messages = [...messages, ...globalMessages];
  } // Handle field messages for current flow


  for (var remediation of neededToProceed) {
    var T = flow[remediation.name];

    if (!T) {
      continue;
    }

    var remediator = new T(remediation);
    var fieldMessages = remediator.getMessages();

    if (fieldMessages) {
      messages = [...messages, ...fieldMessages];
    }
  }

  return messages;
}

function getNextStep(remediator, idxResponse) {
  var nextStep = remediator.getNextStep();
  var canSkip = canSkipFn(idxResponse);
  var canResend = canResendFn(idxResponse);
  return _objectSpread(_objectSpread(_objectSpread({}, nextStep), canSkip && {
    canSkip
  }), canResend && {
    canResend
  });
}

function handleIdxError(e, flow, remediator) {
  // Handle idx messages
  if (isRawIdxResponse(e)) {
    var idxState = idx.makeIdxState(e);
    var terminal = isTerminalResponse(idxState);
    var messages = getIdxMessages(idxState, flow);

    if (terminal) {
      return {
        terminal,
        messages
      };
    } else {
      var nextStep = remediator && getNextStep(remediator, idxState);
      return _objectSpread({
        messages
      }, nextStep && {
        nextStep
      });
    }
  } // Thrown error terminates the interaction with idx


  throw e;
}

function getActionFromValues(values) {
  var valueName = Object.keys(values).find(valueName => actionsTriggeredByValues[valueName]);
  return actionsTriggeredByValues[valueName];
}

function removeActionFromValues(values, action) {
  var executedActionValue = Object.keys(actionsTriggeredByValues).find(valueName => actionsTriggeredByValues[valueName] === action);
  return Object.keys(values).filter(valueName => valueName !== executedActionValue).reduce((newValues, valueName) => {
    newValues[valueName] = values[valueName];
    return newValues;
  }, {});
} // This function is called recursively until it reaches success or cannot be remediated


export function remediate(_x, _x2, _x3) {
  return _remediate.apply(this, arguments);
}

function _remediate() {
  _remediate = _asyncToGenerator(function* (idxResponse, values, options) {
    var {
      neededToProceed,
      interactionCode
    } = idxResponse;
    var {
      flow,
      flowMonitor
    } = options; // If the response contains an interaction code, there is no need to remediate

    if (interactionCode) {
      return {
        idxResponse
      };
    } // Reach to terminal state


    var terminal = isTerminalResponse(idxResponse);
    var messages = getIdxMessages(idxResponse, flow);

    if (terminal) {
      return {
        terminal,
        messages
      };
    } // Try actions in idxResponse first


    var actionFromValues = getActionFromValues(values);
    var actions = [...(options.actions || []), ...(actionFromValues && [actionFromValues] || [])];

    if (actions) {
      for (var action of actions) {
        var valuesWithoutExecutedAction = removeActionFromValues(values, action);

        if (typeof idxResponse.actions[action] === 'function') {
          try {
            idxResponse = yield idxResponse.actions[action]();
          } catch (e) {
            return handleIdxError(e, flow);
          }

          if (action === 'cancel') {
            return {
              canceled: true
            };
          }

          return remediate(idxResponse, valuesWithoutExecutedAction, options); // recursive call
        }
      }
    }

    var remediator = getRemediator(neededToProceed, values, options);

    if (!remediator) {
      throw new AuthSdkError("\n      No remediation can match current flow, check policy settings in your org.\n      Remediations: [".concat(neededToProceed.reduce((acc, curr) => acc ? acc + ' ,' + curr.name : curr.name, ''), "]\n    "));
    }

    if (flowMonitor.loopDetected(remediator)) {
      throw new AuthSdkError("\n      Remediation run into loop, break!!! remediation: ".concat(remediator.getName(), "\n    "));
    } // Recursive loop breaker
    // Return next step to the caller


    if (!remediator.canRemediate()) {
      var nextStep = getNextStep(remediator, idxResponse);
      return {
        idxResponse,
        nextStep
      };
    }

    var name = remediator.getName();
    var data = remediator.getData();

    try {
      idxResponse = yield idxResponse.proceed(name, data); // Track succeed remediations in the current transaction

      yield flowMonitor.trackRemediations(name); // Successfully get interaction code

      if (idxResponse.interactionCode) {
        return {
          idxResponse
        };
      } // Reach to terminal state


      var _terminal = isTerminalResponse(idxResponse);

      var _messages = getIdxMessages(idxResponse, flow);

      if (_terminal) {
        return {
          terminal: _terminal,
          messages: _messages
        };
      } // Handle idx message in nextStep


      if (_messages.length) {
        var _nextStep = getNextStep(remediator, idxResponse);

        return {
          nextStep: _nextStep,
          messages: _messages
        };
      } // We may want to trim the values bag for the next remediation
      // Let the remediator decide what the values should be (default to current values)


      values = remediator.getValuesAfterProceed();
      return remediate(idxResponse, values, options); // recursive call
    } catch (e) {
      return handleIdxError(e, flow, remediator);
    }
  });
  return _remediate.apply(this, arguments);
}
//# sourceMappingURL=remediate.js.map