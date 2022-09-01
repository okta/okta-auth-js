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


import { Remediator, RemediationValues } from './Remediator';
import { getAuthenticator, Authenticator, AuthenticatorValues } from '../../authenticator';
import { IdxRemediation, IdxContext } from '../../types/idx-js';
import { OktaAuthIdxInterface, NextStep } from '../../types';

export type VerifyAuthenticatorValues = AuthenticatorValues & RemediationValues;

// Base class - DO NOT expose static remediationName
export class VerifyAuthenticator<T extends VerifyAuthenticatorValues = VerifyAuthenticatorValues>
  extends Remediator<T> {

  authenticator: Authenticator<VerifyAuthenticatorValues>;

  constructor(remediation: IdxRemediation, values: T = {} as T) {
    super(remediation, values);
    this.authenticator = getAuthenticator(remediation);
  }

  getNextStep(authClient: OktaAuthIdxInterface, context?: IdxContext): NextStep {
    const nextStep = super.getNextStep(authClient, context);
    const authenticatorEnrollments = context?.authenticatorEnrollments?.value;

    return {
      ...nextStep,
      authenticatorEnrollments
    };
  }

  canRemediate() {
    return this.authenticator.canVerify(this.values);
  }

  mapCredentials() {
    return this.authenticator.mapCredentials(this.values);
  }

  getInputCredentials(input) {
    return this.authenticator.getInputs(input);
  }

  getValuesAfterProceed(): T {
    this.values = super.getValuesAfterProceed();
    let trimmedValues = Object.keys(this.values).filter(valueKey => valueKey !== 'credentials');
    return trimmedValues.reduce((values, valueKey) => ({...values, [valueKey]: this.values[valueKey]}), {} as T);
  }
}
