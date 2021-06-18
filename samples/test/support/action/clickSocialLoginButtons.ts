import { waitForPopup } from '../../util/browserUtils';
import clickElement from './clickElement';
import { getOktaSignInForm } from  '../../util';

export default async () => {
  const OktaSignIn = getOktaSignInForm();
  await waitForPopup(() => clickElement('click', 'selector', OktaSignIn.signinWithFacebookBtn));
  await waitForPopup(() => clickElement('click', 'selector', OktaSignIn.signinWithGoogleBtn));
};
