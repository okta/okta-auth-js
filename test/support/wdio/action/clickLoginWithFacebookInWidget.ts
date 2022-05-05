import clickElement from './clickElement';
import { getOktaSignInForm } from  '../lib/getOktaSignInForm';

export default async () => {
  const OktaSignIn = getOktaSignInForm();
  await clickElement('click', 'selector', OktaSignIn.signinWithFacebookBtn);
};
