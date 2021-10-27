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
import { Identify, SelectAuthenticatorAuthenticate, ChallengeAuthenticator, AuthenticatorVerificationData, ResetAuthenticator, ReEnrollAuthenticator } from './remediators';
import { PasswordRecoveryFlowMonitor } from './flowMonitors';
var flow = {
  'identify': Identify,
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'challenge-authenticator': ChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reset-authenticator': ResetAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator
};
export function recoverPassword(_x, _x2) {
  return _recoverPassword.apply(this, arguments);
}

function _recoverPassword() {
  _recoverPassword = _asyncToGenerator(function* (authClient, options) {
    var flowMonitor = new PasswordRecoveryFlowMonitor(authClient);
    return run(authClient, _objectSpread(_objectSpread({}, options), {}, {
      flow,
      flowMonitor,
      actions: ['currentAuthenticator-recover', 'currentAuthenticatorEnrollment-recover']
    }));
  });
  return _recoverPassword.apply(this, arguments);
}
//# sourceMappingURL=recoverPassword.js.map