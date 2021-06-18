import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import UserHome from '../selectors/UserHome';
import ActionContext from '../context';

export default async function(this: ActionContext) {
  // verify profile info
  await waitForDisplayed(UserHome.email, false);
  const userName = this.credentials?.emailAddress || this.userName || process.env.USERNAME;
  await checkEqualsText('element', UserHome.email, false, userName as string);
}
