import { getConfig } from '../../util';
import FacebookSignin from  '../selectors/FacebookSignin';
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
  await waitForDisplayed(FacebookSignin.username);
  await setInputField('set', fbUsername as string, FacebookSignin.username);
  await setInputField('set', fbPassword as string, FacebookSignin.password);
  await clickElement('click', 'selector', FacebookSignin.submit);

  // allow application
  try {
    await waitForDisplayed(FacebookSignin.continue, false, 5000);
    await clickElement('click', 'selector', FacebookSignin.continue);
  } catch (err) {
    // facebook user has already allowed application
  }
}
