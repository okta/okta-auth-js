import PasswordRecover from '../selectors/PasswordRecover';
import clickElement from './clickElement';

export default async () => {
  await clickElement('click', 'selector', PasswordRecover.submit);
};
