import clickElement from './clickElement';
import { OktaSignInV1, OktaSignInOIE } from  '../selectors';

export default async () => {
  const OktaSignIn = process.env.ORG_OIE_ENABLED ? OktaSignInOIE : OktaSignInV1;
  await clickElement('click', 'selector', OktaSignIn.signinWithGoogleBtn);
};
