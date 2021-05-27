import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';

import LoginForm from '../selectors/LoginForm';

export default async (expectedMessage: string) => {
  await waitForDisplayed(LoginForm.formMessage, false);
  await checkEqualsText('button', LoginForm.formMessage, false, expectedMessage);
};
