import clickElement from './clickElement';
import { getOktaSignInForm } from  '../../util';

export default async () => {
  const OktaSignIn = getOktaSignInForm();
  await clickElement('click', 'selector', OktaSignIn.signinWithOktaOIDCIdPBtn);
};
