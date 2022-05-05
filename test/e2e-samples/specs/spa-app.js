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
  getSampleConfig,
  getConfig,
} from '../util';
import startApp from '@okta/test.support/wdio/action/startApp';
import clickProfile from '@okta/test.support/wdio/action/clickProfile';
import loginWidget from '@okta/test.support/wdio/action/loginWidget';
import loginRedirect from '@okta/test.support/wdio/action/loginRedirect';
import logoutRedirect from '@okta/test.support/wdio/action/logoutRedirect';
import openRedirectUrl from '@okta/test.support/wdio/action/openRedirectUrl';

import checkProfile from '../support/check/checkProfile';
import checkNoProfile from '../support/check/checkNoProfile';
import checkNoWidget from '../support/check/checkNoWidget';
import { default as _loginDirect } from '../support/action/loginDirect';
import checkSocialLoginButton from '../support/check/checkSocialLoginButton';
import SpaApp from '../pageobjects/SpaApp';

const sampleConfig = getSampleConfig();
const config = getConfig();

// Bind login direct to the app's selectors
function loginDirect(options) {
  return _loginDirect({
    ...options,
    selectors: SpaApp.selectors
  });
}

describe('spa-app: ' + sampleConfig.name, () => {

  afterEach(async () => {
    await browser.reloadSession();
  });

  it('can login using redirect', async () => {
    await startApp('/', { authMethod: 'redirect', requireUserSession: true });
    await loginRedirect();
    await checkProfile();
    await logoutRedirect();
  });

  // TODO: fix this flaky test OKTA-464122
  // [UPDATE 4/4/22] Re-enabling
  it('can use memory token storage', async () => {
    await startApp('/', { authMethod: 'redirect', requireUserSession: true, storage: 'memory' });
    await loginRedirect();
    await checkProfile();
    await logoutRedirect();
  });

  it('can get user info', async () => {
    await startApp('/', { authMethod: 'redirect', requireUserSession: false });
    await loginRedirect();
    await checkNoProfile();
    await clickProfile();
    await checkProfile();
    await logoutRedirect();
  });

  if (sampleConfig.signinForm) {
    it('can login directly, calling signin() with username and password', async () => {
      await startApp('/', { authMethod: 'form', requireUserSession: true });
      await loginDirect();
      await checkProfile();
      await logoutRedirect();
    });
  }

  if (sampleConfig.signinWidget) {
    it('can login using an embedded widget', async () => {
      await startApp('/', { authMethod: 'widget' });
      await loginWidget({
        username: config.username,
        password: config.password
      });
      await checkProfile();
      await logoutRedirect();
    });
  
    it('does not show the widget when receiving error=access_denied on redirect', async () => {
      await startApp('/', {
        authMethod: 'widget'
      });
      await openRedirectUrl(sampleConfig.redirectPath, config, {
        error: 'access_denied',
        authMethod: 'widget'
      });

      await checkNoWidget();
    });

    it('shows the widget when receiving error=interaction_required on redirect', async () => {
      await startApp('/', {
        authMethod: 'widget'
      });
      await openRedirectUrl(sampleConfig.redirectPath, config, {
        error: 'interaction_required',
        authMethod: 'widget'
      });

      await loginWidget({
        username: config.username,
        password: config.password
      });
      await checkProfile();
      await logoutRedirect();
    });

    it('show social login buttons in self-hosted widget', async () => {
      await startApp('/', {
        authMethod: 'widget',
        idps: 'Facebook:111 Google:222'
      });
      await checkSocialLoginButton('social-auth-facebook-button', '111');
      await checkSocialLoginButton('social-auth-google-button', '222');
    });
  }
});