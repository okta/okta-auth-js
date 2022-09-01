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


import { IdxRemediation, IdxRemediationValue, IdxAuthenticator } from '../types/idx-js';
import { RemediateOptions } from '../types';
import { Remediator, RemediationValues } from './Base/Remediator';
import { Authenticator, Credentials, OktaPassword } from '../authenticator';

export interface EnrollProfileValues extends RemediationValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  credentials?: Credentials;
  password?: string;
  passcode?: string;
}

export class EnrollProfile extends Remediator<EnrollProfileValues> {
  static remediationName = 'enroll-profile';

  authenticator: Authenticator<any> | null = null;

  constructor(
    remediation: IdxRemediation,
    values: EnrollProfileValues = {},
    options: RemediateOptions = {}
  ) {
    super(remediation, values, options);

    // credentials are only required when Profile Enrollment policy requires them
    // if credentials are included in the remediation, they are considered required
    // otherwise it will be omitted
    const credentials = this.getCredentialsFromRemediation();
    if (credentials) {
      this.authenticator = this.authenticator = new OktaPassword({} as IdxAuthenticator);
    }
  }

  canRemediate() {
    // ensure credentials can be verified, if required
    if (this.authenticator && !this.authenticator.canVerify(this.values)) {
      return false;
    }

    const userProfileFromValues = this.getData().userProfile;
    if (!userProfileFromValues) {
      return false;
    }
    // eslint-disable-next-line max-len
    const userProfileFromRemediation = this.remediation.value!.find(({ name }) => name === 'userProfile') as IdxRemediationValue;
    return userProfileFromRemediation.form!.value.reduce((canRemediate, curr) => {
      if (curr.required) {
        canRemediate = canRemediate && !!userProfileFromValues[curr.name];
      }
      return canRemediate;
    }, true);
  }

  getCredentialsFromRemediation () {
    return this.remediation.value!.find(({ name }) => name === 'credentials');
  }

  mapUserProfile({form: { value: profileAttributes }}) {
    const attributeNames = profileAttributes.map(({name}) => name);
    const data = attributeNames.reduce((attributeValues, attributeName) => (
      this.values[attributeName] ? {
      ...attributeValues,
      [attributeName]: this.values[attributeName]
    } : attributeValues), {});
    if (Object.keys(data).length === 0) {
      return;
    }
    return data;
  }

  mapCredentials() {
    const val = this.authenticator && this.authenticator.mapCredentials(this.values);
    if (!val) {
      return;
    }
    return val;
  }

  getInputUserProfile(input) {
    return [...input.form.value];
  }

  getInputCredentials(input) {
    return [...input.form.value];
  }

  getErrorMessages(errorRemediation) {
    return errorRemediation.value[0].form.value.reduce((errors, field) => {
      if (field.messages) {
        errors.push(field.messages.value[0].message);
      }
      return errors;
    }, []);
  }
}