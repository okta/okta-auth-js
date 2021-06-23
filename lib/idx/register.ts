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


import { run, RemediationFlow } from './run';
import { transactionMetaExist } from './transactionMeta';
import { startTransaction } from './startTransaction';
import { 
  SelectEnrollProfile,
  EnrollProfile,
  EnrollProfileValues,
  SelectAuthenticatorEnroll,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticator,
  EnrollAuthenticatorValues,
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  Skip,
  SkipValues,
} from './remediators';
import { RegistrationFlowMonitor } from './flowMonitors';
import { AuthSdkError } from '../errors';
import { 
  IdxOptions, 
  IdxTransaction, 
  OktaAuth, 
  IdxFeature,
  IdxStatus,
} from '../types';

const flow: RemediationFlow = {
  'select-enroll-profile': SelectEnrollProfile,
  'enroll-profile': EnrollProfile,
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'enroll-authenticator': EnrollAuthenticator,
  'skip': Skip,
};

export type RegistrationOptions = IdxOptions 
  & EnrollProfileValues 
  & SelectAuthenticatorEnrollValues 
  & EnrollAuthenticatorValues 
  & AuthenticatorEnrollmentDataValues 
  & SkipValues;

export async function register(
  authClient: OktaAuth, options: RegistrationOptions
): Promise<IdxTransaction> {
  // Only check at the beginning of the transaction
  if (!transactionMetaExist(authClient)) {
    const { enabledFeatures } = await startTransaction(authClient, options);
    if (enabledFeatures && !enabledFeatures.includes(IdxFeature.REGISTRATION)) {
      const error = new AuthSdkError('Registration is not supported based on your current org configuration.');
      return { status: IdxStatus.FAILURE, error };
    }
  }
  
  const flowMonitor = new RegistrationFlowMonitor(authClient);
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
