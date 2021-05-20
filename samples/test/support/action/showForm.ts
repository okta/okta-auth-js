import waitForDisplayed from '../wait/waitForDisplayed';
import LoginForm from '../selectors/LoginForm';
import startApp from './startApp';

export default async (
  formName: 'Password'
) => {
  let url = '/';
  let queryParams;
  let selector;
  switch (formName) {
    case 'Password': {
        url = '/login';
        selector = LoginForm.password;
        queryParams = { flow: 'form' };
        break;
    }

    default: {
        throw new Error(`Unknown form "${formName}"`);
    }
  }

  await startApp(url, queryParams);
  await waitForDisplayed(selector, false);
};
