import checkEqualsText from './checkEqualsText';
import checkElementExists from './checkElementExists';
import waitForDisplayed from '../wait/waitForDisplayed';

import UserHome from '../selectors/UserHome';

export default async (falseCase: boolean) => {
  if (falseCase) {
    // verify no profile info
    await checkElementExists('no', UserHome.email);
  } else {
    // verify profile info
    await waitForDisplayed(UserHome.email, false);
    await checkEqualsText('element', UserHome.email, false, process.env.USERNAME as string);
  }
};
