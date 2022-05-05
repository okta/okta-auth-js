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


import A18nClient from '../management-api/a18nClient';
import clickElement from './clickElement';

export default async function (a18nClient: A18nClient, profileId: string) {
  let retryResend = 3;
  let code = await a18nClient.getSMSCode(profileId);
  while (!code && retryResend-- > 0) {
    await clickElement('click', 'selector', 'button[name=resend]');
    code = await a18nClient.getSMSCode(profileId);
  }
  if (!code) {
    throw new Error('Failed to get sms code');
  }
  return code;
}
