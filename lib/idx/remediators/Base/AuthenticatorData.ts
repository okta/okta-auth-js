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
import { Authenticator } from '../../types';
import { IdxRemediationValue, IdxOption, IdxRemediation } from '../../types/idx-js';

export type AuthenticatorDataValues = RemediationValues & {
  methodType?: string;
};

// Base class - DO NOT expose static remediationName
export class AuthenticatorData extends Remediator {

  map = {
    'authenticator': []
  };

  values: AuthenticatorDataValues;

  constructor(remediation: IdxRemediation, values: AuthenticatorDataValues = {}) {
    super(remediation, values);

    // Unify authenticator input type
    const { authenticators } = this.values;
    const authenticatorKey = this.getAuthenticator().key;
    const authenticator = (authenticators as Authenticator[])
        ?.find(authenticator => authenticator.key === authenticatorKey);
    if (authenticator) {
      // map
      this.values.authenticators = authenticators.map(authenticator => {
        if (authenticatorKey === authenticator.type) {
          return this.mapAuthenticatorFromValues(authenticator);
        }
        return authenticator;
      });
    } else {
      // add
      this.values.authenticators = [
        ...authenticators, 
        this.mapAuthenticatorFromValues()
      ] as Authenticator[];
    }
  }

  getNextStep() {
    const common = super.getNextStep();
    const options = this.getMethodTypes();
    return { 
      ...common, 
      ...(options && { options }) 
    };
  }

  // Grab authenticator from authenticators list
  protected getAuthenticatorFromValues(): Authenticator {
    if (!this.values.authenticators) {
      return null;
    }

    const authenticatorKey = this.getAuthenticator().key;
    const authenticator = (this.values.authenticators as Authenticator[])
      .find(authenticator => authenticator.key === authenticatorKey);
    return authenticator;
  }

  protected mapAuthenticatorFromValues(authenticator?: Authenticator): Authenticator {
    // add methodType to authenticator if it exists in values
    const key = this.getAuthenticator().key;
    const { methodType } = this.values;
    return { 
      key, 
      ...(authenticator && authenticator),
      ...(methodType && { methodType }) 
    };
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
}
