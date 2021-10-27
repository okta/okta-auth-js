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
export function getAllValues(idxRemediation) {
  return idxRemediation.value.map(r => r.name);
}
export function getRequiredValues(idxRemediation) {
  return idxRemediation.value.reduce((required, cur) => {
    if (cur.required) {
      required.push(cur.name);
    }

    return required;
  }, []);
}
export function titleCase(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
export function getAuthenticatorFromRemediation(remediation) {
  return remediation.value.find(_ref => {
    var {
      name
    } = _ref;
    return name === 'authenticator';
  });
}
//# sourceMappingURL=util.js.map