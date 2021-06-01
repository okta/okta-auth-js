import setInputField from '../setInputField';
import PasswordReset from '../../selectors/PasswordReset';

export default async function() {
  await setInputField('set', this.user.profile.email, PasswordReset.username);
}
