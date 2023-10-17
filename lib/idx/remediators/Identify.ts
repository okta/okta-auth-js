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


import { Credentials } from '../authenticator';
import { Remediator, RemediationValues } from './Base/Remediator';

export interface IdentifyValues extends RemediationValues {
  username?: string;
  password?: string;
  credentials?: Credentials;
  rememberMe?: boolean;
}

export class Identify extends Remediator<IdentifyValues> {
  static remediationName = 'identify';

  map = {
    'identifier': ['username']
  };

  canRemediate(): boolean {
    const { identifier } = this.getData();
    return !!identifier;
  }

  mapCredentials() {
    const { credentials, password } = this.values;
    if (!credentials && !password) {
      return;
    }
    return credentials || { passcode: password };
  }

  getInputCredentials(input) {
    return {
      ...input.form.value[0],
      name: 'password',
      required: input.required
    };
  }

}
