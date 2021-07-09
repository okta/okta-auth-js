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


import WebApp from '../pageobjects/WebApp';
import { startApp, getSampleConfig, loginDirect } from '../util';

const sampleConfig = getSampleConfig();

describe('web-app: ' + sampleConfig.name, () => {

  // TODO: fix this test. Fails in incognito, succeeds in regular window. May be related to 3rd party cookies.
  // xit('can login directly, calling signin() with username and password', async () => {
  //   await startApp(WebApp);
  //   await loginDirect(WebApp);
  //   if (sampleConfig.oidc) {
  //     await browser.pause(5000);
  //     await WebApp.assertAccessToken();
  //   } else {
  //     await WebApp.assertLoginSuccess();
  //   }
  // });

  it('will show error if wrong password is provided', async () => {
    await startApp(WebApp);
    await loginDirect(WebApp, { password: 'wrong' });
    await WebApp.assertLoginFailure();
  });

});