import checkEqualsText from '../checkEqualsText';
import UserHome from '../../selectors/UserHome';
import ActionContext from '../../context';

export default async function(this: ActionContext) {
  const firstName = this.credentials?.firstName || this.user?.profile?.firstName;
  const lastName = this.credentials?.lastName || this.user?.profile?.lastName;
  await checkEqualsText('element', UserHome.name, false, `${firstName} ${lastName}` as string);
}
