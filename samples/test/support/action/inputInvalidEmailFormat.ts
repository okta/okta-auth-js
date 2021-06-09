import setInputField from './setInputField';
import Registration from '../selectors/Registration';

export default async (
) => {
  const invalidEmailFormat = '3.14e2';
  await setInputField('set', invalidEmailFormat, Registration.email);
};
