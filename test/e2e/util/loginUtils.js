import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import { switchToPopupWindow, switchToMainWindow } from './browserUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

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

async function handleCallback(flow, responseMode) {
  await TestApp.waitForCallback();
  const url = await browser.getUrl();
  (flow === 'pkce') ? assertPKCE(url, responseMode) : assertImplicit(url, responseMode);
  await TestApp.handleCallback();
  await TestApp.assertCallbackSuccess();
  await TestApp.returnHome();
  return url;
}

async function loginPopup() {
  await TestApp.loginPopup();
  await switchToPopupWindow();
  await OktaLogin.signin(USERNAME, PASSWORD);
  await switchToMainWindow();
  await TestApp.assertLoggedIn();
}

async function loginRedirect(flow, responseMode) {
  await TestApp.loginRedirect();
  await OktaLogin.signin(USERNAME, PASSWORD);
  return handleCallback(flow, responseMode);
}

async function loginDirect(flow) {
  await TestApp.username.then(el => el.setValue(USERNAME));
  await TestApp.password.then(el => el.setValue(PASSWORD));
  await TestApp.loginDirect();
  return handleCallback(flow);
}

async function loginWidget(flow) {
  await TestApp.showLoginWidget();
  await OktaLogin.signin(USERNAME, PASSWORD);
  return handleCallback(flow);
}

export { loginWidget, loginDirect, loginPopup, loginRedirect };
