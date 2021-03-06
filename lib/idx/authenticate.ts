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


import { 
  OktaAuth,
  IdxOptions,
  IdxTransaction,
} from '../types';
import { run, RemediationFlow } from './run';
import { 
  Identify,
  IdentifyValues,
  SelectAuthenticatorAuthenticate,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticator,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorValues,
  RedirectIdp,
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  SelectAuthenticatorEnroll,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticator,
  EnrollAuthenticatorValues,
  AuthenticatorVerificationData,
} from './remediators';
import { AuthenticationFlowMonitor } from './flowMonitors';

const flow: RemediationFlow = {
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

export type AuthenticationOptions = IdxOptions 
  & IdentifyValues 
  & SelectAuthenticatorAuthenticateValues 
  & SelectAuthenticatorEnrollValues
  & ChallengeAuthenticatorValues 
  & ReEnrollAuthenticatorValues
  & AuthenticatorEnrollmentDataValues
  & EnrollAuthenticatorValues;

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<IdxTransaction> {
  const flowMonitor = new AuthenticationFlowMonitor(authClient);
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
