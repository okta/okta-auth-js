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
import { 
  SelectAuthenticatorEnroll,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticator,
  EnrollAuthenticatorValues,
  AuthenticatorEnrollmentData,
  AuthenticatorEnrollmentDataValues,
  Skip,
  SkipValues,
} from './remediators';
import { ActivationFlowMonitor } from './flowMonitors';
import { 
  IdxOptions, 
  IdxStatus, 
  IdxTransaction, 
  OktaAuth, 
} from '../types';
import { AuthSdkError } from '../errors';

const flow: RemediationFlow = {
  'authenticator-enrollment-data': AuthenticatorEnrollmentData,
  'select-authenticator-enroll': SelectAuthenticatorEnroll,
  'enroll-authenticator': EnrollAuthenticator,
  'skip': Skip,
};

export type ActivationOptions = IdxOptions 
  & SelectAuthenticatorEnrollValues 
  & EnrollAuthenticatorValues 
  & AuthenticatorEnrollmentDataValues 
  & SkipValues;

export async function activate(
  authClient: OktaAuth, options: ActivationOptions
): Promise<IdxTransaction> {
  // Only check at the beginning of the transaction
  if (!transactionMetaExist(authClient)) {
    if (!options.activationToken) {
      const error = new AuthSdkError('No activationToken passed');
      return { status: IdxStatus.FAILURE, error };
    }
  }
  
  const flowMonitor = new ActivationFlowMonitor(authClient);
  return run(authClient, { 
    ...options, 
    flow,
    flowMonitor,
  });
}
