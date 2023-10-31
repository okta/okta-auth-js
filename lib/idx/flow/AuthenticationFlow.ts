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


import { RemediationFlow } from './RemediationFlow';
import { 
  Identify,
  SelectAuthenticatorAuthenticate,
  ChallengeAuthenticator,
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorWarning,
  RedirectIdp,
  AuthenticatorEnrollmentData,
  SelectAuthenticatorEnroll,
  EnrollAuthenticator,
  AuthenticatorVerificationData,
  EnrollPoll,
  ChallengePoll,
  SelectEnrollmentChannel,
  EnrollmentChannelData,
  Skip
} from '../remediators';

export const AuthenticationFlow: RemediationFlow = {
  'identify': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'enroll-authenticator': EnrollAuthenticator,
  'challenge-authenticator': ChallengeAuthenticator,
  'challenge-poll': ChallengePoll,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'reenroll-authenticator-warning': ReEnrollAuthenticatorWarning,
  'enroll-poll': EnrollPoll,
  'select-enrollment-channel': SelectEnrollmentChannel,
  'enrollment-channel-data': EnrollmentChannelData,
  'redirect-idp': RedirectIdp,
  'skip': Skip,
};
