import GoogleSignIn from  '../selectors/GoogleSignIn';
import Home from  '../selectors/Home';
import waitForDisplayed from '../wait/waitForDisplayed';
import setInputField from './setInputField';
import clickElement from './clickElement';
import ActionContext from '../context';

export default async function(
  this: ActionContext,
  options: Record<string, string> = {}
) {
  const googleUsername = options.googleUsername || process.env.GOOGLE_USERNAME;
  if (!googleUsername) {
    throw new Error('GOOGLE_USERNAME was not set');
  }
  const googlePassword = options.googlePassword || process.env.GOOGLE_PASSWORD;
  if (!googlePassword) {
    throw new Error('GOOGLE_PASSWORD was not set');
  }

  // save username to context
  this.userName = googleUsername;

  // enter login
  await waitForDisplayed(GoogleSignIn.identifier);
  await waitForDisplayed(GoogleSignIn.identifierNext);
  await setInputField('set', googleUsername, GoogleSignIn.identifier);
  await clickElement('click', 'selector', GoogleSignIn.identifierNext);

  // enter password
  await waitForDisplayed(GoogleSignIn.password);
  await waitForDisplayed(GoogleSignIn.passwordNext);
  await setInputField('set', googlePassword, GoogleSignIn.password);
  await clickElement('click', 'selector', GoogleSignIn.passwordNext);

  // wait for redirect
  await waitForDisplayed(Home.serverConfig, false);
}

