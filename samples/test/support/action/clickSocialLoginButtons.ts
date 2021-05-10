import { waitForPopup } from '../../util/browserUtils';
import clickElement from './clickElement';
import { OktaSignInV1, OktaSignInOIE } from  '../selectors';

export default async () => {
  const OktaSignIn = process.env.ORG_OIE_ENABLED ? OktaSignInOIE : OktaSignInV1;
  await waitForPopup(() => clickElement('click', 'selector', OktaSignIn.signinWithFacebookBtn));
  await waitForPopup(() => clickElement('click', 'selector', OktaSignIn.signinWithGoogleBtn));
};
