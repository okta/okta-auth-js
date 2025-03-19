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
import OktaLogin from '../pageobjects/OktaLogin';
import { switchToPopupWindow, switchToLastFocusedWindow, switchToMainWindow } from './browserUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const FB_USERNAME = process.env.FB_USERNAME;
const FB_PASSWORD = process.env.FB_PASSWORD;

function assertPKCE(url, responseMode) {
  const char = responseMode === 'fragment' ? '#' : '?';
  const str = url.split(char)[1];
  assert(str.indexOf('code' > 0));
}

function assertImplicit(url, responseMode) {
  const char = responseMode === 'query' ? '?' : '#';
  const str = url.split(char)[1];
  assert(str.indexOf('id_token' > 0));
}

export async function handleCallback(flow, responseMode) {
  await TestApp.waitForCallback();
  const url = await browser.getUrl();
  (flow === 'pkce') ? assertPKCE(url, responseMode) : assertImplicit(url, responseMode);
  await TestApp.handleCallback();
  await TestApp.assertCallbackSuccess();
  await TestApp.returnHome();
  return url;
}

export async function handleIDPPopupCallback () {
  await TestApp.waitForCallback();
  const url = await browser.getUrl();
  await TestApp.handleIDPPopupCallback();
  await switchToMainWindow();
  await TestApp.assertCallbackSuccess();
  await TestApp.returnHome();
  return url;
}

export async function loginPopup() {
  const existingHandlesCount = (await browser.getWindowHandles()).length;
  await TestApp.loginPopup();
  await switchToPopupWindow(existingHandlesCount);

  if (process.env.ORG_OIE_ENABLED) {
    await OktaLogin.signinOIE(USERNAME, PASSWORD);
  } else {
    await OktaLogin.signinLegacy(USERNAME, PASSWORD);
  }

  await switchToLastFocusedWindow();
  await TestApp.assertLoggedIn();
}

export async function loginIDPPopup() {
  const existingHandlesCount = (await browser.getWindowHandles()).length;
  await TestApp.loginIDPPopup();
  await switchToPopupWindow(existingHandlesCount);

  if (process.env.ORG_OIE_ENABLED) {
    await OktaLogin.signinOIE(USERNAME, PASSWORD);
  } else {
    await OktaLogin.signinLegacy(USERNAME, PASSWORD);
  }

  await handleIDPPopupCallback();
  await switchToMainWindow();
  await TestApp.assertLoggedIn();
}

export async function loginRedirect(flow, responseMode) {
  await TestApp.loginRedirect();
  await OktaLogin.signin(USERNAME, PASSWORD);
  return handleCallback(flow, responseMode);
}

export async function loginDirect(setCredentials = true) {
  if (setCredentials) {
    await TestApp.username.then(el => el.setValue(USERNAME));
    await TestApp.password.then(el => el.setValue(PASSWORD));
  }
  await TestApp.loginDirect();
}

export async function loginWidget(flow, forceRedirect=false) {
  await TestApp.showLoginWidget();

  // OIE widget is only displayed for direct auth with PKCE even with OIE enabled orgs
  // For direct auth implicit flow, we still use the v1 flow (since interaction code doesn't)
  if (flow === 'implicit' || !process.env.ORG_OIE_ENABLED) {
    await OktaLogin.signinLegacy(USERNAME, PASSWORD);   
  } else {
    await OktaLogin.signinOIE(USERNAME, PASSWORD);
  }
  
  if (forceRedirect) {
    return handleCallback(flow);
  }
  await TestApp.assertLoggedIn();
}

export async function loginWidgetFacebook(flow, forceRedirect) {
  await TestApp.loginRedirect();
  await OktaLogin.signinFacebook(FB_USERNAME, FB_PASSWORD);

  if (forceRedirect) {
    return handleCallback(flow);
  }
  await TestApp.assertLoggedIn();
}
