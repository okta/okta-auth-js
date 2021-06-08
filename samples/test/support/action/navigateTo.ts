import waitForDisplayed from '../wait/waitForDisplayed';
import LoginForm from '../selectors/LoginForm';
import Home from '../selectors/Home';
import startApp from './startApp';

export default async (
  userName: string,
  formName: string
) => {
  let url = '/';
  let queryParams;
  let selector;
  let isNotDisplayed = false;
  switch (formName) {
    case 'the Basic Login View':
    case 'Login with Username and Password': {
        url = '/login';
        selector = LoginForm.password;
        queryParams = { flow: 'form' };
        break;
    }

    case 'the Root View': {
      url = '/';
      selector = Home.serverConfig;
      queryParams = { flow: 'form' };
      break;
    }

    case 'the Self Service Password Reset View': {
      url = '/recover-password';
      selector = 'a[href="/recover-password"]';
      isNotDisplayed = true;
      break;
    }

    case 'the Self Service Registration View': {
      url = '/register';
      selector = 'a[href="/register"]';
      isNotDisplayed = true;
      break;
    }

    default: {
        throw new Error(`Unknown form "${formName}"`);
    }
  }

  await startApp(url, queryParams);
  await waitForDisplayed(selector, isNotDisplayed);
};
