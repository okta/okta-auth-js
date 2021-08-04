import { OktaSignInV1, OktaSignInOIE } from  '../support/selectors';

function getOktaSignInForm() {
  return process.env.ORG_OIE_ENABLED ? OktaSignInOIE : OktaSignInV1;
}

export { getOktaSignInForm };
