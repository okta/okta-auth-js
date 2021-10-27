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
import { Identify, SelectAuthenticatorAuthenticate, ChallengeAuthenticator, ReEnrollAuthenticator, RedirectIdp, AuthenticatorEnrollmentData, SelectAuthenticatorEnroll, EnrollAuthenticator, AuthenticatorVerificationData } from './remediators';
import { AuthenticationFlowMonitor } from './flowMonitors';
var flow = {
  'identify': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'enroll-authenticator': EnrollAuthenticator,
  'challenge-authenticator': ChallengeAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'redirect-idp': RedirectIdp
};
export function authenticate(_x, _x2) {
  return _authenticate.apply(this, arguments);
}

function _authenticate() {
  _authenticate = _asyncToGenerator(function* (authClient, options) {
    var flowMonitor = new AuthenticationFlowMonitor(authClient);
    return run(authClient, _objectSpread(_objectSpread({}, options), {}, {
      flow,
      flowMonitor
    }));
  });
  return _authenticate.apply(this, arguments);
}
//# sourceMappingURL=authenticate.js.map