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


import { AuthSdkError } from '../../errors';
import { AuthenticatorData, AuthenticatorDataValues } from './Base/AuthenticatorData';

export type AuthenticatorVerificationDataValues = AuthenticatorDataValues;

export class AuthenticatorVerificationData extends AuthenticatorData {
  static remediationName = 'authenticator-verification-data';

  values!: AuthenticatorVerificationDataValues;

  canRemediate() {
    // auto proceed if there is only one method
    if (this.authenticator.methods.length === 1) {
      return true;
    }
    return super.canRemediate();
  }

  mapAuthenticator() {
    const authenticatorData = this.getAuthenticatorData();
    const authenticatorFromRemediation = this.getAuthenticatorFromRemediation();

    // auto proceed with the only methodType option
    if (this.authenticator.methods.length === 1) {
      return authenticatorFromRemediation.form?.value.reduce((acc, curr) => {
        if (curr.value) {
          acc[curr.name] = curr.value;
        } else if (curr.options) {
          acc[curr.name] = curr.options![0].value;
        } else {
          throw new AuthSdkError(`Unsupported authenticator data type: ${curr}`);
        }
        return acc;
      }, {});
    }

    // return based on user selection
    return { 
      id: authenticatorFromRemediation.form!.value
        .find(({ name }) => name === 'id')!.value,
      enrollmentId: authenticatorFromRemediation.form!.value
        .find(({ name }) => name === 'enrollmentId')?.value,
      methodType: authenticatorData?.methodType,
    };
  }

  getInputAuthenticator() {
    const authenticator = this.getAuthenticatorFromRemediation();
    const methodType = authenticator.form!.value.find(({ name }) => name === 'methodType');
    // if has methodType in form, let user select the methodType
    if (methodType && methodType.options) {
      return { name: 'methodType', type: 'string', required: true };
    }
    // no methodType, then return form values
    const inputs = [...authenticator.form!.value];
    return inputs;
  }

}
