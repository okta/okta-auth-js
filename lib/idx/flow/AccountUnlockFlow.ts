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
  SelectAuthenticatorUnlockAccount,
  SelectAuthenticatorAuthenticate,
  ChallengeAuthenticator,
  ChallengePoll,
  AuthenticatorVerificationData,
  ReEnrollAuthenticatorWarning
} from '../remediators';

export const AccountUnlockFlow: RemediationFlow = {
  'identify': Identify,
  // NOTE: unlock-account is purposely not included. Handled as action
  // because it's a rememdiation which requires no input
  // 'unlock-account': UnlockAccount,
  'select-authenticator-unlock-account': SelectAuthenticatorUnlockAccount,
  'select-authenticator-authenticate': SelectAuthenticatorAuthenticate,
  'challenge-authenticator': ChallengeAuthenticator,
  'challenge-poll': ChallengePoll,
  'authenticator-verification-data': AuthenticatorVerificationData,
  'reenroll-authenticator-warning': ReEnrollAuthenticatorWarning,
};
