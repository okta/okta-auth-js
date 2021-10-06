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


import { Remediator, RemediationValues } from './Base/Remediator';
import { Authenticator, AuthenticatorKey } from '../types';
import { IdxRemediation } from '../types/idx-js';

export interface IdentifyValues extends RemediationValues {
  username?: string;
  password?: string;
}

export class Identify extends Remediator {
  static remediationName = 'identify';

  values: IdentifyValues;

  map = {
    'identifier': ['username'],
    'credentials': []
  };

  constructor(remediation: IdxRemediation, values?: IdentifyValues) {
    super(remediation, values);

    // add password authenticator to authenticators list if password is provided
    const { password, authenticators } = this.values;
    if (password && !authenticators.some(authenticator => authenticator.type === 'password')) {
      this.values = {
        ...this.values,
        authenticators: [{ type: 'password' }, ...authenticators] as Authenticator[]
      };
    }
  }

  canRemediate() {
    const { identifier } = this.getData();
    return !!identifier;
  }

  mapCredentials() {
    return { passcode: this.values.password };
  }

  getInputCredentials(input) {
    return {
      ...input.form.value[0],
      name: 'password',
      required: input.required
    };
  }

  getValuesAfterProceed() {
    // Handle username + password scenario
    // remove "password" from authenticator array when remediation is finished
    if (this.remediation.value.some(({ name }) => name === 'credentials')) {
      const authenticators = (this.values.authenticators as Authenticator[])
        ?.filter(authenticator => authenticator.key !== AuthenticatorKey.OKTA_PASSWORD);
      return { ...this.values, authenticators };
    }

    return super.getValuesAfterProceed();
  }
}
