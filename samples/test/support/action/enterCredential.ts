import setInputField from './setInputField';
import getLoginForm from '../lib/getLoginForm';
import { getConfig } from '../../util/configUtils';
import ActionContext from '../context';

/* eslint complexity:[0,8] */
export default async function (
  this: ActionContext,
  credName: string
) {
  const config = getConfig();
  let selector = null;
  let value;
  const isLiveProfile = !!this.credentials;
  const loginForm = getLoginForm(this.featureName);
  switch (credName) {
    case 'incorrect username': {
      selector = loginForm.username;
      value = 'Mory';
      break;
    }
    case 'incorrect password': {
      selector = loginForm.password;
      value = '!wrong!';
      break;
    }
    case 'username':
    case 'correct username': {
      selector = loginForm.username;
      value = isLiveProfile && this.credentials.emailAddress || config.username;
      break;
    }
    case 'password':
    case 'correct password': {
      selector = loginForm.password;
      value = isLiveProfile && this.credentials.password || config.password;
      break;
    }
    default: {
        throw new Error(`Unknown credential "${credName}"`);
    }
  }
  if (!value) {
    throw new Error(`No value set for credential "${credName}"`);
  }
  await setInputField('set', value, selector);
}
