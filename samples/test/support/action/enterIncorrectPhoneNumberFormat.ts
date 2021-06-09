import EnrollPhoneAuthenticator from '../selectors/EnrollPhoneAuthenticator';
import setInputField from './setInputField';

export default async function () {
  await setInputField('set', 'incorrectnumber', EnrollPhoneAuthenticator.phoneNumber);
}
