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


import { getConfig } from '../../util/configUtils';
import waitForDisplayed from '../wait/waitForDisplayed';
import setInputField from './setInputField';
import clickElement from './clickElement';
import { getOktaSignInForm } from  '../../util';

export default async (
  options: Record<string, string> = {}
) => {
  const OktaSignIn = getOktaSignInForm();
  await waitForDisplayed(OktaSignIn.signinSubmitBtn);

  const config = getConfig();
  const username = options.username || config.username;
  if (!username) {
    throw new Error('USERNAME was not set');
  }
  const password = options.password || config.password;
  if (!password) {
    throw new Error('PASSWORD was not set');
  }

  await setInputField('set', username, OktaSignIn.signinUsername);
  await setInputField('set', password, OktaSignIn.signinPassword);
  await clickElement('click', 'selector', OktaSignIn.signinSubmitBtn);
};
