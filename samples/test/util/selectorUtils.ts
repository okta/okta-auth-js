import { OktaSignInV1, OktaSignInOIE } from  '../support/selectors';

function getOktaSignInForm(useInteractionCodeFlow?: boolean) {
  const useOIE = useInteractionCodeFlow != undefined ? useInteractionCodeFlow : process.env.ORG_OIE_ENABLED;
  return useOIE ? OktaSignInOIE : OktaSignInV1;
}

export { getOktaSignInForm };
