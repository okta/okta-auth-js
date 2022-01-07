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
import { getAuthenticator, Authenticator } from '../../authenticator';
import { IdxRemediation } from '../../types/idx-js';

export interface VerifyAuthenticatorValues extends RemediationValues {
  verificationCode?: string;
  password?: string;
  questionKey?: string;
  question?: string;
  answer?: string;
  otp?: string;
}

// Base class - DO NOT expose static remediationName
export class VerifyAuthenticator extends Remediator {

  authenticator: Authenticator;
  values: VerifyAuthenticatorValues;

  map = {
    'credentials': []
  };

  constructor(remediation: IdxRemediation, values: RemediationValues = {}) {
    super(remediation, values);
    this.authenticator = getAuthenticator(remediation);
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

}
