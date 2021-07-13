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


import OktaSigninPage from '../pageobjects/OktaSigninPage';
import { getConfig } from './configUtils';
import { waitForPopup } from './browserUtils';

async function loginRedirect(App) {
  const config = getConfig();
  await App.loginRedirect();
  await OktaSigninPage.signin(config.username, config.password);
}

async function loginDirect(App, options) {
  options = options || {};
  const config = getConfig();
  await App.username.then(el => el.setValue(options.username || config.username));
  await App.password.then(el => el.setValue(options.password || config.password));
  await App.loginDirect();
}

async function loginWidget() {
  const config = getConfig();
  await OktaSigninPage.signin(config.username, config.password);
}

async function clickSocialLoginButtons() {
  await waitForPopup(() => OktaSigninPage.clickSigninWithFacebook());
  await waitForPopup(() => OktaSigninPage.clickSigninWithGoogle());
}

export { loginDirect, loginRedirect, loginWidget, clickSocialLoginButtons };
