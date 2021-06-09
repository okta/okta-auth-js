import waitForDisplayed from '../wait/waitForDisplayed';

import checkContainsText from './checkContainsText';

export default async (expectedMessage: string) => {
  await waitForDisplayed('#form-messages', false);
  await checkContainsText('button', '#form-messages', '', expectedMessage);
};
