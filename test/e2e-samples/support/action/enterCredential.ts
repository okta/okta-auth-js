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


import setInputField from './setInputField';
import getLoginForm from '../lib/getLoginForm';
import { getConfig } from '../../util/configUtils';
import ActionContext from '../context';

/* eslint complexity:[0,8] */
export default async function (
  this: ActionContext,
  credName: string
) {
  const config = getConfig();
  let selector = null;
  let value;
  const isLiveProfile = !!this.credentials;
  const loginForm = getLoginForm(this.featureName);
  switch (credName) {
    case 'incorrect username': {
      selector = loginForm.username;
      value = 'Mory';
      break;
    }
    case 'incorrect password': {
      selector = loginForm.password;
      value = '!wrong!';
      break;
    }
    case 'username':
    case 'correct username': {
      selector = loginForm.username;
      value = isLiveProfile && this.credentials.emailAddress || config.username;
      break;
    }
    case 'password':
    case 'correct password': {
      selector = loginForm.password;
      value = isLiveProfile && this.credentials.password || config.password;
      break;
    }
    default: {
        throw new Error(`Unknown credential "${credName}"`);
    }
  }
  if (!value) {
    throw new Error(`No value set for credential "${credName}"`);
  }
  await setInputField('set', value, selector);
}
