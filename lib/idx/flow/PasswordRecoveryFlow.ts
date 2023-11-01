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
  AuthenticatorVerificationData,
  ResetAuthenticator,
  ReEnrollAuthenticator,
  ReEnrollAuthenticatorWarning,
  SelectAuthenticatorEnroll,
  AuthenticatorEnrollmentData,
  EnrollPoll
} from '../remediators';

export const PasswordRecoveryFlow: RemediationFlow = {
  'identify': Identify,
  'identify-recovery': Identify,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'challenge-authenticator': ChallengeAuthenticator,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'reset-authenticator': ResetAuthenticator,
  'reenroll-authenticator': ReEnrollAuthenticator,
  'reenroll-authenticator-warning': ReEnrollAuthenticatorWarning,
  'enroll-poll': EnrollPoll,
};
