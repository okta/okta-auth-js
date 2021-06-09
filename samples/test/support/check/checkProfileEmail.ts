import checkEqualsText from './checkEqualsText';
import UserHome from '../selectors/UserHome';
import ActionContext from '../context';

export default async function(this: ActionContext) {
  const userName = this.credentials?.emailAddress || process.env.USERNAME;
  await checkEqualsText('element', UserHome.email, false, userName as string);
}
