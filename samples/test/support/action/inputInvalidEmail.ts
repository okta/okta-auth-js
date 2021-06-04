import setInputField from './setInputField';
import PasswordRecover from '../selectors/PasswordRecover';

export default async (
) => {
  const invalidEmail = 'test_with_really_invalid_email@invalidemail.com';
  await setInputField('set', invalidEmail, PasswordRecover.username);
};
