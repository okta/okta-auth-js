import ActionContext from '../../context';
import { UserHome } from '../../selectors';
import waitForDisplayed from '../../wait/waitForDisplayed';
import checkEqualsText from '../checkEqualsText';

export default async function(this: ActionContext) {
  // verify profile info
  await waitForDisplayed(UserHome.email, false);
  const userName = this.credentials?.emailAddress || this.user?.profile?.login;
  await checkEqualsText('element', UserHome.email, false, userName as string);
}
