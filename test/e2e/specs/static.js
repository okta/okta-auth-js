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


import StaticApp from '../pageobjects/StaticApp';
import OktaLogin from '../pageobjects/OktaLogin';
import TestApp from '../pageobjects/TestApp';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('Static App', () => {

  beforeEach(async () => {
    await StaticApp.open();
  });

  it('can login, display userinfo, and logout', async () => {
    await StaticApp.clickLogin();
    await OktaLogin.signin(USERNAME, PASSWORD);
    await StaticApp.assertUserInfo();
    await StaticApp.assertNoError();
    await StaticApp.clickLogout();
    await TestApp.waitForLoginBtn();
  });

});