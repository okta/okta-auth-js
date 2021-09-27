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

export interface VerifyAuthenticatorValues extends RemediationValues {
  verificationCode?: string;
  password?: string;
}

// Base class - DO NOT expose static remediationName
export class VerifyAuthenticator extends Remediator {

  values: VerifyAuthenticatorValues;

  map = {
    'credentials': []
  };

  canRemediate() {
    return !!(this.values.password || this.values.verificationCode);
  }

  mapCredentials() {
    return { 
      passcode: this.values.verificationCode || this.values.password
    };
  }

  getInputCredentials(input) {
    const challengeType = this.getAuthenticator().type;
    const name = challengeType === 'password' ? 'password' : 'verificationCode';
    return {
      ...input.form.value[0],
      name,
      type: 'string',
      required: input.required
    };
  }

  getValuesAfterProceed() {
    let values = super.getValuesAfterProceed() as VerifyAuthenticatorValues;
    const authenticator = this.getAuthenticator();
    if (authenticator.type === 'password') {
      delete values.password;
    } else {
      delete values.verificationCode;
    }
    return values;
  }

}
