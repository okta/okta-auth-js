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


import TestServer from '../pageobjects/TestServer';

const ISSUER = process.env.ISSUER;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

describe('Server-side login', () => {

  beforeEach(async () => {
    await TestServer.open();
  });

  it('can receive sessionToken with valid username/password', async () => {
    await TestServer.issuer.then(el => el.setValue(ISSUER));
    await TestServer.username.then(el => el.setValue(USERNAME));
    await TestServer.password.then(el => el.setValue(PASSWORD));

    await TestServer.submitLogin();
    await TestServer.assertLoginSuccess();
  });

  it('will throw error for wrong password', async() => {
    await TestServer.issuer.then(el => el.setValue(ISSUER));
    await TestServer.username.then(el => el.setValue(USERNAME));
    await TestServer.password.then(el => el.setValue('wrong password!!!'));

    await TestServer.submitLogin();
    await TestServer.assertLoginFailure();
  });

});