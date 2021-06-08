import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import UserHome from '../selectors/UserHome';

export default async function () {
  // verify profile info
  await waitForDisplayed(UserHome.email, false);
  const userName = this.credentials?.emailAddress || process.env.USERNAME;
  await checkEqualsText('element', UserHome.email, false, userName as string);
}
