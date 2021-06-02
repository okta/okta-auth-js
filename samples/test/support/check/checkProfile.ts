import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import UserHome from '../selectors/UserHome';

export default async () => {
  // verify profile info
  await waitForDisplayed(UserHome.email, false);
  await checkEqualsText('element', UserHome.email, false, process.env.USERNAME as string);
};
