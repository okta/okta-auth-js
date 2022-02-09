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


import { getConfig } from '../../../util';
import FacebookSignIn from '../../selectors/FacebookSignIn';
import waitForDisplayed from '../../wait/waitForDisplayed';
import setInputField from '../setInputField';
import clickElement from '../clickElement';
import ActionContext from '../../context';

export default async function(
  this: ActionContext
) {
  const { fbUsername, fbPassword } = getConfig();

  // save username to context
  this.userName = fbUsername;

  // enter login and password
  await waitForDisplayed(FacebookSignIn.username);
  await setInputField('set', fbUsername as string, FacebookSignIn.username);
  await setInputField('set', fbPassword as string, FacebookSignIn.password);
  await clickElement('click', 'selector', FacebookSignIn.submit);
}
