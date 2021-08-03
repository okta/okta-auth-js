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


import {
  toQueryString,
  getSampleConfig,
  getConfig,
} from '../util';
import startApp from '../support/action/startApp';
import checkProfile from '../support/check/checkProfile';
import checkNoProfile from '../support/check/checkNoProfile';
import clickProfile from '../support/action/clickProfile';
import loginDirect from '../support/action/loginDirect';
import loginWidget from '../support/action/loginWidget';
import loginRedirect from '../support/action/loginRedirect';
import logoutRedirect from '../support/action/logoutRedirect';
import clickSocialLoginButtons from '../support/action/clickSocialLoginButtons';

const sampleConfig = getSampleConfig();
const config = getConfig();

describe('spa-app: ' + sampleConfig.name, () => {

  it('can login using redirect', async () => {
    await startApp('/', { requireUserSession: true });
    await loginRedirect();
    await checkProfile();
    await logoutRedirect();
  });

  it('can use memory token storage', async () => {
    await startApp('/', { requireUserSession: true, storage: 'memory' });
    await loginRedirect();
    await checkProfile();
    await logoutRedirect();
  });

  it('can get user info', async () => {
    await startApp('/', { requireUserSession: false });
    await loginRedirect();
    await checkNoProfile();
    await clickProfile();
    await checkProfile();
    await logoutRedirect();
  });

  if (sampleConfig.signinForm) {
    it('can login directly, calling signin() with username and password', async () => {
      await startApp('/', { flow: 'form', requireUserSession: true });
      await loginDirect();
      await checkProfile();
      await logoutRedirect();
    });
  }

  if (sampleConfig.signinWidget) {
    it('can login using a self-hosted widget', async () => {
      await startApp('/', { flow: 'widget' });
      await loginWidget();
      await checkProfile();
      await logoutRedirect();
    });
  
    // TODO: enable these tests
    // it('does not show the widget when receiving error=access_denied on redirect', async () => {
    //   await startApp('/', { flow: 'widget' });
    //   await browser.url(sampleConfig.redirectPath + toQueryString(Object.assign({
    //     error: 'access_denied',
    //     flow: 'widget'
    //   }, config)));

    //   await loginWidget();
    //   await checkProfile();
    //   await logoutRedirect();
    // });

    it('shows the widget when receiving error=interaction_required on redirect', async () => {
      await startApp('/', { flow: 'widget' });
      await browser.url(sampleConfig.redirectPath + toQueryString(Object.assign({
        error: 'interaction_required',
        flow: 'widget'
      }, config)));

      await loginWidget();
      await checkProfile();
      await logoutRedirect();
    });

    it('show social login buttons in self-hosted widget', async () => {
      await startApp('/', { flow: 'widget', idps: 'Facebook:111 Google:222' });
      await clickSocialLoginButtons();
    });
  }
});