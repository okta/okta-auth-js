import setInputField from '../setInputField';
import PasswordRecover from '../../selectors/PasswordRecover';

export default async function() {
  await setInputField('set', this.user.profile.email, PasswordRecover.username);
}
