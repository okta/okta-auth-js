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

/* global window */

import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import { openPKCE } from '../util/appUtils';
import { loginRedirect, loginPopup, loginDirect } from '../util/loginUtils';

async function countDPoPKeys () {
  await browser.setTimeout({ script: 5000 });
  const result = await browser.executeAsync(function (dbName, storeName, done) {
    const indexedDB = window.indexedDB;
    const req = indexedDB.open(dbName, 1);

    req.onsuccess = function () {
      const db = req.result;
      const tx = db.transaction(storeName, 'readonly');

      const store = tx.objectStore(storeName);

      const query = store.count();
      query.onsuccess = function () {
        done(query.result);
      };

      tx.oncomplete = function () {
        db.close();
      };
    };
  }, 'OktaAuthJs', 'DPoPKeys');
  return result;
}

async function assertNoRemainingDPoPKeys () {
  const count = await countDPoPKeys();
  console.log(count);
  assert(count === 0);
}

async function bootstrap(options = {}) {
  await openPKCE({...options, dpop: true, useClassicEngine: false});
  await TestApp.dpopOptionOn.then(el => el.isSelected()).then(isSelected => {
    assert(isSelected);
  });
}

describe('E2E login', () => {
  const flow = 'pkce';

  it('can login using redirect with responseMode=fragment', async () => {
    await bootstrap({ responseMode: 'fragment' });
    await TestApp.responseModeFragment.then(el => el.isSelected()).then(isSelected => {
      assert(isSelected === true);
    });
    // await TestApp.useClassicEngineOption.then(el => el.click());
    await loginRedirect('pkce', 'fragment');
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
    await assertNoRemainingDPoPKeys();
  });

  // widget-based tests cannot be added until new authjs client is updated in siw
  // xit('can login using signin widget (no redirect)', async () => {
  //   await bootstrap();
  //   await loginWidget(flow);
  //   await TestApp.getUserInfo();
  //   await TestApp.assertUserInfo();
  //   await TestApp.logoutRedirect();
  //   await assertNoRemainingDPoPKeys();
  // });

  // // widget-based tests cannot be added until new authjs client is updated in siw
  // xit('can login using signin widget (with redirect)', async () => {
  //   let options = { forceRedirect: true };
  //   await bootstrap(options);
  //   await loginWidget(flow, true);
  //   await TestApp.getUserInfo();
  //   await TestApp.assertUserInfo();
  //   await TestApp.logoutRedirect();
  //   await assertNoRemainingDPoPKeys();
  // });

  it('can login using redirect', async () => {
    await bootstrap();
    await loginRedirect(flow);
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
    await assertNoRemainingDPoPKeys();
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
    await assertNoRemainingDPoPKeys();
  });

  it('can login using a popup window', async() => {
    await bootstrap();
    await loginPopup();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
    await assertNoRemainingDPoPKeys();
  });

  it('can login directly, calling signin() with username and password', async () => {
    await bootstrap();
    await loginDirect();
    await TestApp.getUserInfo();
    await TestApp.assertUserInfo();
    await TestApp.logoutRedirect();
    await assertNoRemainingDPoPKeys();
  });
});