import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import OktaLogin from '../pageobjects/OktaLogin';
import { switchToPopupWindow, switchToMainWindow } from './browserUtils';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

function assertPKCE(url) {
  const hash = url.split('#')[1];
  assert(hash.indexOf('code' > 0));
}

function assertImplicit(url) {
  const hash = url.split('#')[1];
  assert(hash.indexOf('id_token' > 0));
}

async function handleCallback(flow) {
  await TestApp.waitForCallback();
  const url = await browser.getUrl();
  (flow === 'pkce') ? assertPKCE(url) : assertImplicit(url);
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

async function loginRedirect(flow) {
  await TestApp.loginRedirect();
  await OktaLogin.signin(USERNAME, PASSWORD);
  return handleCallback(flow);
}

async function loginDirect(flow) {
  await TestApp.username.then(el => el.setValue(USERNAME));
  await TestApp.password.then(el => el.setValue(PASSWORD));
  await TestApp.loginDirect();
  return handleCallback(flow);
}
export { loginDirect, loginPopup, loginRedirect };
