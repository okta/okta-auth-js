import { getConfig } from '../../util';
import FacebookSignIn from  '../selectors/FacebookSignIn';
import waitForDisplayed from '../wait/waitForDisplayed';
import setInputField from './setInputField';
import clickElement from './clickElement';
import ActionContext from '../context';

export default async function(
  this: ActionContext
) {
  const { fbUsername, fbPassword } = getConfig();

  // save username to context
  this.userName = fbUsername;

  // enter login and password
  await waitForDisplayed(FacebookSignIn.username);
  await setInputField('set', fbUsername as string, FacebookSignIn.username);
  await setInputField('set', fbPassword as string, FacebookSignIn.password);
  await clickElement('click', 'selector', FacebookSignIn.submit);
}
