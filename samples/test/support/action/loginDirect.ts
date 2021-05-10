import { LoginForm } from  '../selectors';
import waitForDisplayed from '../wait/waitForDisplayed';
import clickElement from './clickElement';
import setInputField from './setInputField';
import { getConfig } from '../../util/configUtils';

export default async (
  options: Record<string, string> = {}
) => {
  await waitForDisplayed(LoginForm.username, false);
  const config = getConfig();
  const username = options.username || config.username;
  if (!username) {
    throw new Error('USERNAME was not set');
  }
  const password = options.password || config.password;
  if (!password) {
    throw new Error('PASSWORD was not set');
  }
  await setInputField('set', username, LoginForm.username);
  await setInputField('set', password, LoginForm.password);

  await clickElement('click', 'selector', LoginForm.submit);
};
