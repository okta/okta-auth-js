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


import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import { openPKCE } from '../util/appUtils';
import { loginWidget, loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

describe('E2E login', () => {
  async function bootstrap(options = {}) {
    return openPKCE({...options, dpop: true, useInteractionCodeFlow: true});
  }

  it('can login using redirect with responseMode=fragment', async () => {
    await openPKCE({ responseMode: 'fragment' });
    await TestApp.responseModeFragment.then(el => el.isSelected()).then(isSelected => {
      assert(isSelected === true);
    });
    await TestApp.interactionCodeOption.then(el => el.click());
    await loginRedirect('pkce', 'fragment');
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  it('can login using signin widget (no redirect)', async () => {
    await bootstrap();
    await loginWidget(flow);
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  it('can login using signin widget (with redirect)', async () => {
    let options = { forceRedirect: true };
    await bootstrap(options);
    await loginWidget(flow, true);
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  it('can login using redirect', async () => {
    await bootstrap();
    await loginRedirect(flow);
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  it('can specify acr_values', async () => {
    const acrValues = 'urn:okta:loa:1fa:any';
    await bootstrap({ acrValues });
    await loginRedirect(flow);
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    const idToken = await TestApp.getIdToken();
    assert(idToken.claims.acr === acrValues);
    await TestApp.logoutRedirect();
  });

  it('can login using a popup window', async() => {
    await bootstrap();
    await loginPopup();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });

  it('can login directly, calling signin() with username and password', async () => {
    await bootstrap();
    await loginDirect();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
  });
});