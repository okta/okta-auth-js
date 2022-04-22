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

import { IdxRemediation, IdxRemediationValue } from '../types/idx-js';

export function getAllValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value?.map(r => r.name);
}

export function getRequiredValues(idxRemediation: IdxRemediation) {
  return idxRemediation.value?.reduce((required, cur) => {
    if (cur.required) {
      required.push(cur.name as never);
    }
    return required;
  }, []);
}

export function titleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function getAuthenticatorFromRemediation(
  remediation: IdxRemediation
): IdxRemediationValue {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return remediation.value!.find(({ name }) => name === 'authenticator') as IdxRemediationValue;
}
