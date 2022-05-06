import { clickElement } from './clickElement';
import { getOktaSignInForm } from  '../lib/getOktaSignInForm';

export const clickLoginWithFacebookInWidget = async () => {
  const OktaSignIn = getOktaSignInForm();
  await clickElement('click', 'selector', OktaSignIn.signinWithFacebookBtn);
};
