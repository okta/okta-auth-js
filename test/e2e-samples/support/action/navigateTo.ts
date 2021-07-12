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


import waitForDisplayed from '../wait/waitForDisplayed';
import LoginForm from '../selectors/LoginForm';
import OktaSignInOIE from '../selectors/OktaSignInOIE';
import Home from '../selectors/Home';
import startApp from './startApp';

// eslint-disable-next-line complexity
function getContext(formName: string) {
  let url = '/';
  let queryParams;
  let selector;
  let isNotDisplayed = false;
  switch (formName) {
    case 'the Login View':
    case 'the Basic Login View':
    case 'Login with Username and Password':
    case 'Basic Social Login View':
      url = '/login';
      selector = LoginForm.password;
      queryParams = { flow: 'form' };
      break;
    case 'the Root View': 
      url = '/';
      selector = Home.container;
      queryParams = { flow: 'form' };
      break;  
    case 'the Self Service Password Reset View':
      url = '/recover-password';
      selector = 'a[href="/recover-password"]';
      isNotDisplayed = true;
      break;
    case 'the Self Service Registration View':
      url = '/register';
      selector = 'a[href="/register"]';
      isNotDisplayed = true;
      break;
    case 'the Embedded Widget View':
      url = '/login';
      selector = OktaSignInOIE.signinUsername;
      queryParams = { flow: 'widget' };
      break;
    case 'Login with Social IDP': {
      url = '/login';
      selector = OktaSignInOIE.signinWithFacebookBtn;
      queryParams = { flow: 'widget' };
      break;
    }
    default:
      throw new Error(`Unknown form "${formName}"`);
  }

  return { url, selector, queryParams, isNotDisplayed };
}

export default async (
  userName: string,
  formName: string
) => {
  const { url, queryParams, selector, isNotDisplayed } = getContext(formName);
  await startApp(url, queryParams);
  await waitForDisplayed(selector, isNotDisplayed);
};
