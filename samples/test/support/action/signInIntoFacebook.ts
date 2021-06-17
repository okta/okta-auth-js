import { getConfig } from '../../util';
import FacebookSignIn from '../selectors/FacebookSignIn';
import clickElement from './clickElement';
import setInputField from './setInputField';

export default async function() {
  const { fbUsername, fbPassword } = getConfig();
  await setInputField('set', fbUsername as string, FacebookSignIn.username);
  await setInputField('set', fbPassword as string, FacebookSignIn.password);
  await clickElement('click', 'selector', FacebookSignIn.submit);
}
