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
  OktaAuthInterface,
  IdxTransaction,
} from '../types';
import { run } from './run';
import { AuthenticationOptions } from './authenticate';
import {
  EnrollPollValues as EnrollPollOptions,
  SelectEnrollmentChannelValues as SelectEnrollmentChannelOptions
} from './remediators';
import { RegistrationOptions } from './register';
import { PasswordRecoveryOptions } from './recoverPassword';
import { AccountUnlockOptions } from './unlockAccount';
import { getSavedTransactionMeta } from './transactionMeta';
import { AuthSdkError } from '../errors';

export type ProceedOptions = AuthenticationOptions
  & RegistrationOptions
  & PasswordRecoveryOptions
  & AccountUnlockOptions
  & EnrollPollOptions
  & SelectEnrollmentChannelOptions
  & { step?: string };

export function canProceed(authClient: OktaAuthInterface, options: ProceedOptions = {}): boolean {
  const meta = getSavedTransactionMeta(authClient, options);
  return !!(meta || options.stateHandle);
}

export async function proceed(
  authClient: OktaAuthInterface,
  options: ProceedOptions = {}
): Promise<IdxTransaction> {

  if (!canProceed(authClient, options)) {
    throw new AuthSdkError('Unable to proceed: saved transaction could not be loaded');
  }

  let { flow, state } = options;
  if (!flow) {
    const meta = getSavedTransactionMeta(authClient, { state });
    flow = meta?.flow;
  }

  return run(authClient, { 
    ...options, 
    flow
  });
}
