/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { RemediationFlow } from '../flow';
import { RemediateAction } from '../remediate';
import { FlowIdentifier } from './FlowIdentifier';
import {
  AuthenticatorVerificationDataValues,
  EnrollProfileValues,
  ResetAuthenticatorValues,
  SelectAuthenticatorUnlockAccountValues,
  SkipValues,
  EnrollPollValues as EnrollPollOptions,
  SelectEnrollmentChannelValues as SelectEnrollmentChannelOptions,
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticatorValues,
} from '../remediators';
import { IdxTransactionMeta } from './meta';
import { OktaAuthCoreOptions } from '../../core/types';
import { TransactionMetaOptions } from '../../oidc/types';
import { OktaAuthOptionsConstructor } from '../../base/types';

export interface IdxOptions {
  flow?: FlowIdentifier;
  exchangeCodeForTokens?: boolean;
  autoRemediate?: boolean;
  withCredentials?: boolean;
}

export interface InteractOptions extends IdxOptions {
  state?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: string;
  activationToken?: string;
  recoveryToken?: string;
  clientSecret?: string;
  maxAge?: string | number;
  acrValues?: string;
  nonce?: string;
}

export interface IntrospectOptions extends IdxOptions {
  interactionHandle?: string;
  stateHandle?: string;
  version?: string;
  useGenericRemediator?: boolean;
}

export interface RemediateOptions extends IdxOptions {
  step?: string;
  remediators?: RemediationFlow;
  actions?: RemediateAction[];
<<<<<<< Updated upstream
  useGenericRemediator?: boolean; // beta
=======
  useGenericRemediator?: boolean;
>>>>>>> Stashed changes
}

export interface RunOptions extends RemediateOptions, InteractOptions, IntrospectOptions {}

export interface AuthenticationOptions extends
  RunOptions, 
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  SelectAuthenticatorEnrollValues,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  EnrollAuthenticatorValues
{}

export interface RegistrationOptions extends
  RunOptions,
  IdentifyValues,
  EnrollProfileValues,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  SkipValues
{}

export interface PasswordRecoveryOptions extends 
  RunOptions,
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  ResetAuthenticatorValues,
  AuthenticatorVerificationDataValues,
  ReEnrollAuthenticatorValues
{}

export interface AccountUnlockOptions extends
  RunOptions,
  IdentifyValues,
  SelectAuthenticatorUnlockAccountValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  AuthenticatorVerificationDataValues
{}

interface _ProceedOptions extends
  AuthenticationOptions,
  RegistrationOptions,
  PasswordRecoveryOptions,
  AccountUnlockOptions,
  EnrollPollOptions,
  SelectEnrollmentChannelOptions
{}

// export type ProceedOptions = Omit<_ProceedOptions, 'step' | 'actions'>;
export type ProceedOptions = _ProceedOptions;

export type CancelOptions = IdxOptions

export type StartOptions = RunOptions

export interface IdxTransactionMetaOptions
  extends TransactionMetaOptions,
  Pick<IdxTransactionMeta,
    'state' |
    'codeChallenge' |
    'codeChallengeMethod' |
    'codeVerifier' |
    'flow' |
    'activationToken' |
    'recoveryToken'
  >
{}

export interface OktaAuthIdxOptions 
  extends OktaAuthCoreOptions,
  Pick<IdxTransactionMeta,
    'flow' |
    'activationToken' |
    'recoveryToken'
  >
{
    // BETA WARNING: configs in this section are subject to change without a breaking change notice
    idx?: Pick<RunOptions,
      'useGenericRemediator' |
      'exchangeCodeForTokens'
    >;
}

export type OktaAuthIdxOptionsConstructor = OktaAuthOptionsConstructor<OktaAuthIdxOptions>;
