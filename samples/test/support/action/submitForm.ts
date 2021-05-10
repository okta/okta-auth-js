import clickElement from './clickElement';
import LoginForm from '../selectors/LoginForm';

export default async (
) => {
  let selector = LoginForm.submit;
  await clickElement('click', 'selector', selector);
};
