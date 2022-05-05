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


import { LoginForm, Selectors } from  '../selectors';
import clickElement from './clickElement';
import { getConfig } from '../../util/configUtils';
import setInputField from './setInputField';

interface LoginDirectOptions {
  username?: string;
  password?: string;
  selectors?: Selectors;
}

export default async (
  options: LoginDirectOptions
) => {
  const selectors = options.selectors || LoginForm;
  const config = getConfig();
  const username = options.username || config.username;
  if (!username) {
    throw new Error('USERNAME was not set');
  }
  const password = options.password || config.password;
  if (!password) {
    throw new Error('PASSWORD was not set');
  }
  await setInputField('username', username);
  await setInputField('password', password);
  
  await clickElement('click', 'selector', selectors.submit);
};
