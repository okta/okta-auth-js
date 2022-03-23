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


import { AuthenticatorData, AuthenticatorDataValues } from './Base/AuthenticatorData';
import { getAuthenticatorFromRemediation } from './util';

export type AuthenticatorEnrollmentDataValues =  AuthenticatorDataValues & {
  phoneNumber?: string;
  resend?: boolean; // resend is not a remediator value - revise when IdxResponse structure is updated
}
export class AuthenticatorEnrollmentData extends AuthenticatorData {
  static remediationName = 'authenticator-enrollment-data';

  values!: AuthenticatorEnrollmentDataValues;

  mapAuthenticator() {
    const authenticatorData = this.getAuthenticatorData();
    const authenticatorFromRemediation = getAuthenticatorFromRemediation(this.remediation)!;
    return { 
      id: authenticatorFromRemediation.form!.value
        .find(({ name }) => name === 'id')!.value,
      methodType: authenticatorData!.methodType,
      phoneNumber: authenticatorData!.phoneNumber,
    };
  }

  getInputAuthenticator() {
    return [
      { name: 'methodType', type: 'string', required: true },
      { name: 'phoneNumber', type: 'string', required: true, label: 'Phone Number' },
    ];
  }

  protected mapAuthenticatorDataFromValues(data?) {
    // get mapped authenticator from base class
    data = super.mapAuthenticatorDataFromValues(data);
    // add phoneNumber to authenticator if it exists in values
    const { phoneNumber } = this.values;
    if (!data && !phoneNumber) {
      return;
    }

    return { 
      ...(data && data), 
      ...(phoneNumber && { phoneNumber }) 
    };
  }

}
