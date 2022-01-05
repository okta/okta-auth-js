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
import { IdxRemediationValue, IdxOption, IdxRemediation } from '../../types/idx-js';
import { Authenticator } from '../../types';

export type AuthenticatorDataValues = RemediationValues & {
  methodType?: string;
};

// Base class - DO NOT expose static remediationName
export class AuthenticatorData extends Remediator {

  map = {
    'authenticator': []
  };

  values: AuthenticatorDataValues;
  authenticator: Authenticator;

  constructor(remediation: IdxRemediation, values: AuthenticatorDataValues = {}) {
    super(remediation, values);

    // set before other data calculation
    this.authenticator = this.getAuthenticator();

    this.formatAuthenticatorData();
  }

  protected formatAuthenticatorData() {
    const authenticatorData = this.getAuthenticatorData();
    if (authenticatorData) {
      this.values.authenticatorsData = this.values.authenticatorsData.map(data => {
        if (data.key === this.authenticator.key) {
          return this.mapAuthenticatorDataFromValues(data);
        }
        return data;
      });
    } else {
      const data = this.mapAuthenticatorDataFromValues();
      if (data) {
        this.values.authenticatorsData.push(data);
      }
    }
  }

  protected getAuthenticatorData() {
    return this.values.authenticatorsData
      .find(({ key }) => key === this.authenticator.key);
  }

  canRemediate() {
    return this.values.authenticatorsData
      .some(data => data.key === this.authenticator.key);
  }

  getNextStep() {
    const common = super.getNextStep();
    const options = this.getMethodTypes();
    return { 
      ...common, 
      ...(options && { options }) 
    };
  }

  protected mapAuthenticatorDataFromValues(authenticatorData?) {
    // add methodType to authenticatorData if it exists in values
    const { methodType } = this.values;
    const data = { 
      key: this.authenticator.key, 
      ...(authenticatorData && authenticatorData),
      ...(methodType && { methodType }) 
    };

    return data.methodType ? data : null;
  }

  protected getAuthenticatorFromRemediation(): IdxRemediationValue {
    const authenticator = this.remediation.value
      .find(({ name }) => name === 'authenticator');
    return authenticator;
  }

  private getMethodTypes(): IdxOption[] {
    const authenticator: IdxRemediationValue = this.getAuthenticatorFromRemediation();
    return authenticator.form.value.find(({ name }) => name === 'methodType')?.options;
  }

  getValuesAfterProceed(): RemediationValues {
    this.values = super.getValuesAfterProceed();
    // remove used authenticatorData
    const authenticatorsData = this.values.authenticatorsData
      .filter(data => data.key !== this.authenticator.key);
    return { ...this.values, authenticatorsData };
  }
}
