import checkIsOnPage from '../check/checkIsOnPage';
import VerifyPhone from '../selectors/VerifyPhone';
import clickElement from './clickElement';
import selectOption from './selectOption';

export default async () => {
  await selectOption('value', 'sms', VerifyPhone.options);
  await clickElement('click', 'selector', VerifyPhone.submit);
  await checkIsOnPage('Challenge phone authenticator');
};