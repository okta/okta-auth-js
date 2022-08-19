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


import { SelectAuthenticator, SelectAuthenticatorValues } from './Base/SelectAuthenticator';
import { Authenticator } from '../types';
import { IdxRemediationValue } from '../types/idx-js';


export type SelectAuthenticatorUnlockAccountValues = SelectAuthenticatorValues & {
  identifier?: string;
  methodType?: string;
};

export class SelectAuthenticatorUnlockAccount extends SelectAuthenticator<SelectAuthenticatorUnlockAccountValues> {
  static remediationName = 'select-authenticator-unlock-account';
  authenticator?: Authenticator;

  map = {
    identifier: ['username']
  };

  canRemediate() {
    const identifier = this.getData('identifier');
    return !!identifier && super.canRemediate();
  }

  mapAuthenticator(remediationValue: IdxRemediationValue) {
    const authenticatorMap = super.mapAuthenticator(remediationValue);
    const methodTypeOption = this.selectedOption?.value.form.value.find(({ name }) => name === 'methodType');

    // defaults to 'manually defined' value
    // 2nd: option may have pre-defined value, like stateHandle
    // 3rd: if only a single OV option is available, default to that option
    const methodTypeValue = this.values.methodType ||
      methodTypeOption?.value as string || methodTypeOption?.options?.[0]?.value as string;

    if (methodTypeValue) {
      return {
        ...authenticatorMap,
        methodType: methodTypeValue
      };
    }

    return authenticatorMap;
  }

  getInputUsername () {
    return { name: 'username', type: 'string' };
  }

}
