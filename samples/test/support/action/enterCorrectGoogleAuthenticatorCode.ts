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


import EnrollGoogleAuthenticator from '../selectors/EnrollGoogleAuthenticator';
import setInputField from './setInputField';
import ActionContext from '../context';
const totp = require('totp-generator');

export default async function (this: ActionContext) {
  const token = totp(this.sharedSecret || '', {
    timestamp: Date.now() + (this.scenarioName.includes('enroll') ? -30*1000 : 0)
  });
  await setInputField('set', token, EnrollGoogleAuthenticator.code);
}
