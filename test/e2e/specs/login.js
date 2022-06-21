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
import { flows, openImplicit, openPKCE } from '../util/appUtils';
import { loginWidget, loginRedirect, loginPopup, loginDirect, loginWidgetFacebook } from '../util/loginUtils';

describe('E2E login', () => {

  // responseMode=query is not supported for implicit flow
  it('PKCE: can login using redirect with responseMode=fragment', async () => {
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

  flows.forEach(flow => {
    describe(flow + ' flow', () => {
      async function bootstrap(options = {}) {
        (flow === 'pkce') ? await openPKCE(options) : await openImplicit(options);
      }

      it('can login using signin widget (no redirect)', async () => {
        let options = {};
        if (process.env.ORG_OIE_ENABLED && flow === 'pkce') {
          options = { useInteractionCodeFlow: true };
        }
        await bootstrap(options);
        await loginWidget(flow);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      it('can login using signin widget (with redirect)', async () => {
        let options = { forceRedirect: true };
        if (process.env.ORG_OIE_ENABLED && flow === 'pkce') {
          options = Object.assign({ useInteractionCodeFlow: true }, options);
        }
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

      // eslint-disable-next-line jasmine/no-disabled-tests
      xit('can login to social idp using signin widget (with redirect)', async () => {
        // Federated social auth with pinned social login buttons only works with OIE
        if (!process.env.ORG_OIE_ENABLED) {
          return;
        }

        let options = { _forceRedirect: true };
        await bootstrap(options);
        await loginWidgetFacebook(flow, true);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

      // eslint-disable-next-line jasmine/no-disabled-tests
      xit('can login to social idp using signin widget (no redirect)', async () => {
        // Federated social auth with pinned social login buttons only works with OIE
        if (!process.env.ORG_OIE_ENABLED) {
          return;
        }

        let options = { useInteractionCodeFlow: true };
        await bootstrap(options);
        await loginWidgetFacebook(flow, true);
        await TestApp.getUserInfo();
        await TestApp.assertUserInfo();
        await TestApp.logoutRedirect();
      });

    });
  });
});