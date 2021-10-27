"use strict";

exports.authenticate = authenticate;

var _run = require("./run");

var _remediators = require("./remediators");

var _flowMonitors = require("./flowMonitors");

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
const flow = {
  'identify': _remediators.Identify,
  'select-authenticator-authenticate': _remediators.SelectAuthenticatorAuthenticate,
  'select-authenticator-enroll': _remediators.SelectAuthenticatorEnroll,
  'authenticator-enrollment-data': _remediators.AuthenticatorEnrollmentData,
  'authenticator-verification-data': _remediators.AuthenticatorVerificationData,
  'enroll-authenticator': _remediators.EnrollAuthenticator,
  'challenge-authenticator': _remediators.ChallengeAuthenticator,
  'reenroll-authenticator': _remediators.ReEnrollAuthenticator,
  'redirect-idp': _remediators.RedirectIdp
};

async function authenticate(authClient, options) {
  const flowMonitor = new _flowMonitors.AuthenticationFlowMonitor(authClient);
  return (0, _run.run)(authClient, { ...options,
    flow,
    flowMonitor
  });
}
//# sourceMappingURL=authenticate.js.map