import clickElement from './clickElement';
import LoginForm from  '../selectors/LoginForm';

export default async () => {
  await clickElement('click', 'selector', LoginForm.loginWithGoogle);
};
