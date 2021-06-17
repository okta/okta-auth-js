import { getConfig } from '../../util/configUtils';
import waitForDisplayed from '../wait/waitForDisplayed';
import setInputField from './setInputField';
import clickElement from './clickElement';
import { getOktaSignInForm } from  '../../util';

export default async (
  options: Record<string, string> = {}
) => {
  const OktaSignIn = getOktaSignInForm();
  await waitForDisplayed(OktaSignIn.signinSubmitBtn);

  const config = getConfig();
  const username = options.username || config.username;
  if (!username) {
    throw new Error('USERNAME was not set');
  }
  const password = options.password || config.password;
  if (!password) {
    throw new Error('PASSWORD was not set');
  }

  await setInputField('set', username, OktaSignIn.signinUsername);
  await setInputField('set', password, OktaSignIn.signinPassword);
  await clickElement('click', 'selector', OktaSignIn.signinSubmitBtn);
};
