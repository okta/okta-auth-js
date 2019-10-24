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

function handleCallback(flow) {
  TestApp.waitForCallback();
  const url = browser.getUrl();
  (flow === 'pkce') ? assertPKCE(url) : assertImplicit(url);
  TestApp.handleCallback();
  TestApp.assertCallbackSuccess();
  TestApp.returnHome();
  return url;
}

function loginPopup() {
  TestApp.loginPopup();
  switchToPopupWindow();
  OktaLogin.signin(USERNAME, PASSWORD);
  switchToMainWindow();
  TestApp.assertLoggedIn();
}

function loginRedirect(flow) {
  TestApp.loginRedirect();
  OktaLogin.signin(USERNAME, PASSWORD);
  return handleCallback(flow);
}

function loginDirect(flow) {
  TestApp.username.setValue(USERNAME);
  TestApp.password.setValue(PASSWORD);
  TestApp.loginDirect();
  return handleCallback(flow);
}
export { loginDirect, loginPopup, loginRedirect };
