/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { IdxRemediationValue, IdxRemediation, IdxAuthenticator } from '../../types/idx-js';
import { isAuthenticator } from '../../types/api';
import { compareAuthenticators } from '../../authenticator/util';

export type AuthenticatorDataValues = RemediationValues & {
  methodType?: string;
};

// Base class - DO NOT expose static remediationName
export class AuthenticatorData<T extends AuthenticatorDataValues = AuthenticatorDataValues> extends Remediator<T> {
  authenticator: IdxAuthenticator;

  constructor(remediation: IdxRemediation, values: T = {} as T) {
    super(remediation, values);

    // set before other data calculation
    this.authenticator = this.getAuthenticator()!;

    this.formatAuthenticatorData();
  }

  protected formatAuthenticatorData() {
    const authenticatorData = this.getAuthenticatorData();
    if (authenticatorData) {
      this.values.authenticatorsData = this.values.authenticatorsData!.map(data => {
        if (compareAuthenticators(this.authenticator, data)) {
          return this.mapAuthenticatorDataFromValues(data);
        }
        return data;
      });
    } else {
      const data = this.mapAuthenticatorDataFromValues();
      if (data) {
        this.values.authenticatorsData!.push(data);
      }
    }
  }

  protected getAuthenticatorData() {
    return this.values.authenticatorsData!
      .find((data) => compareAuthenticators(this.authenticator, data));
  }

  canRemediate() {
    return this.values.authenticatorsData!
      .some(data => compareAuthenticators(this.authenticator, data));
  }

  protected mapAuthenticatorDataFromValues(authenticatorData?) {
    // add methodType to authenticatorData if it exists in values
    let { methodType, authenticator } = this.values;
    if (!methodType && isAuthenticator(authenticator)) {
     methodType = authenticator?.methodType;
    }
    
    const { id, enrollmentId } = this.authenticator;
    const form = this.getFormValuesFromRemediation();

    const data = {
      ...form,
      id,
      enrollmentId,
      ...(authenticatorData && authenticatorData),
      ...(methodType && { methodType })
    };

    return data.methodType ? data : null;
  }

  protected getAuthenticatorFromRemediation(): IdxRemediationValue {
    const authenticator = this.remediation.value!
      .find(({ name }) => name === 'authenticator') as IdxRemediationValue;
    return authenticator;
  }

  protected getFormValuesFromRemediation (): Record<string, unknown> {
    const values = {};
    const authenticator = this.getAuthenticatorFromRemediation();

    if (authenticator.form) {
      for (const field of authenticator.form.value) {
        const { name, value, mutable } = field;
        if (value) {
          // set property to default value, if one exists
          values[name] = value;
        }

        // TODO: set form values from provided values
        // if (mutable) {
        //   values[name] = this.values[name];
        // }
      }
    }

    return values;
  }

  getValuesAfterProceed(): T {
    this.values = super.getValuesAfterProceed();
    // remove used authenticatorData
    const authenticatorsData = this.values.authenticatorsData!
      .filter(data => compareAuthenticators(this.authenticator, data) !== true);
    return { ...this.values, authenticatorsData };
  }
}
