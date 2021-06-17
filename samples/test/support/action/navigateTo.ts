import waitForDisplayed from '../wait/waitForDisplayed';
import LoginForm from '../selectors/LoginForm';
import { OktaSignInV1, OktaSignInOIE } from  '../selectors';
import Home from '../selectors/Home';
import startApp from './startApp';
const OktaSignIn = process.env.ORG_OIE_ENABLED ? OktaSignInOIE : OktaSignInV1;

// eslint-disable-next-line complexity
function getContext(formName: string) {
  let url = '/';
  let queryParams;
  let selector;
  let isNotDisplayed = false;
  switch (formName) {
    case 'the Login View':
    case 'the Basic Login View':
    case 'Login with Username and Password':
    case 'Basic Social Login View':
      url = '/login';
      selector = LoginForm.password;
      queryParams = { flow: 'form' };
      break;
    case 'the Root View': 
      url = '/';
      selector = Home.serverConfig;
      queryParams = { flow: 'form' };
      break;  
    case 'the Self Service Password Reset View':
      url = '/recover-password';
      selector = 'a[href="/recover-password"]';
      isNotDisplayed = true;
      break;
    case 'the Self Service Registration View':
      url = '/register';
      selector = 'a[href="/register"]';
      isNotDisplayed = true;
      break;
    case 'the Embedded Widget View':
      url = '/login';
      selector = OktaSignInOIE.signinUsername;
      queryParams = { flow: 'widget' };
      break;
    case 'Login with Social IDP': {
      url = '/login';
      selector = OktaSignIn.signinWithGoogleBtn;
      queryParams = { flow: 'widget' };
      break;
    }
    default:
      throw new Error(`Unknown form "${formName}"`);
  }

  return { url, selector, queryParams, isNotDisplayed };
}

export default async (
  userName: string,
  formName: string
) => {
  const { url, queryParams, selector, isNotDisplayed } = getContext(formName);
  await startApp(url, queryParams);
  await waitForDisplayed(selector, isNotDisplayed);
};
