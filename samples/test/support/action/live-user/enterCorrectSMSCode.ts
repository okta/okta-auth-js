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


import a18nClient from '../../management-api/a18nClient';
import setInputField from '../setInputField';
import ActionContext from '../../context';
import clickElement from '../clickElement';
import ChallengeAuthenticator from '../../selectors/ChallengeAuthenticator';

export default async function (this: ActionContext) {
  let retryResend = 3;
  let code = await a18nClient.getSMSCode(this.credentials.profileId);
  while (!code && retryResend-- > 0) {
    await clickElement('click', 'selector', ChallengeAuthenticator.resend);
    code = await a18nClient.getSMSCode(this.credentials.profileId);
  }
  if (!code) {
    throw new Error('Failed to get sms code');
  }
  await setInputField('set', code, ChallengeAuthenticator.code);
}
