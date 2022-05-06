import { clickElement } from './clickElement';
import { getOktaSignInForm } from  '../lib/getOktaSignInForm';

export const clickLoginWithOktaOIDCIdPInWidget = async () => {
  const OktaSignIn = getOktaSignInForm();
  await clickElement('click', 'selector', OktaSignIn.signinWithOktaOIDCIdPBtn);
};
