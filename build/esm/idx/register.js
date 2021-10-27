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
import { run } from './run';
import { transactionMetaExist } from './transactionMeta';
import { startTransaction } from './startTransaction';
import { SelectEnrollProfile, EnrollProfile, SelectAuthenticatorEnroll, EnrollAuthenticator, AuthenticatorEnrollmentData, Skip } from './remediators';
import { RegistrationFlowMonitor } from './flowMonitors';
import { AuthSdkError } from '../errors';
import { IdxFeature, IdxStatus } from '../types';
var flow = {
  'select-enroll-profile': SelectEnrollProfile,
  'enroll-profile': EnrollProfile,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'enroll-authenticator': EnrollAuthenticator,
  'skip': Skip
};
export function register(_x, _x2) {
  return _register.apply(this, arguments);
}

function _register() {
  _register = _asyncToGenerator(function* (authClient, options) {
    // Only check at the beginning of the transaction
    if (!transactionMetaExist(authClient)) {
      var {
        enabledFeatures
      } = yield startTransaction(authClient, options);

      if (enabledFeatures && !enabledFeatures.includes(IdxFeature.REGISTRATION)) {
        var error = new AuthSdkError('Registration is not supported based on your current org configuration.');
        return {
          status: IdxStatus.FAILURE,
          error
        };
      }
    }

    var flowMonitor = new RegistrationFlowMonitor(authClient);
    return run(authClient, _objectSpread(_objectSpread({}, options), {}, {
      flow,
      flowMonitor
    }));
  });
  return _register.apply(this, arguments);
}
//# sourceMappingURL=register.js.map