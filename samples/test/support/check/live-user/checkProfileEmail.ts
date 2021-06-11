import ActionContext from '../../context';
import { UserHome } from '../../selectors';
import checkEqualsText from '../checkEqualsText';


export default async function(this: ActionContext) {
  const userName = this.credentials?.emailAddress || this.user.profile.email;
  await checkEqualsText('element', UserHome.email, false, userName as string);
}
