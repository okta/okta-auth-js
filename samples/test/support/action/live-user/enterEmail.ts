import setInputField from '../setInputField';
import PasswordRecover from '../../selectors/PasswordRecover';
import ActionContext from '../../context';

export default async function(this: ActionContext) {
  await setInputField('set', this.user.profile.email, PasswordRecover.username);
}
