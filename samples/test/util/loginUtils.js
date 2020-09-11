import OktaSigninPage from '../pageobjects/OktaSigninPage';
import { getConfig } from './configUtils';

async function loginRedirect(App) {
  const config = getConfig();
  await App.loginRedirect();
  await OktaSigninPage.signin(config.username, config.password);
}

async function loginDirect(App, options) {
  options = options || {};
  const config = getConfig();
  await App.username.then(el => el.setValue(options.username || config.username));
  await App.password.then(el => el.setValue(options.password || config.password));
  await App.loginDirect();
}

async function loginWidget() {
  const config = getConfig();
  await OktaSigninPage.signin(config.username, config.password);
}

export { loginDirect, loginRedirect, loginWidget };
