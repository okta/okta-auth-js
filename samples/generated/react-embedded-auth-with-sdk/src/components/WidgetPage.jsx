import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import OktaSignIn from '@okta/okta-signin-widget';
import { useOktaAuth } from '@okta/okta-react';
import '@okta/okta-signin-widget/css/okta-sign-in.min.css';
import oidcConfig from '../config';

const WidgetPage = () => {
  const history = useHistory();
  const { oktaAuth } = useOktaAuth();
  const widgetRef = useRef();

  // Fetch configs from query params
  const queryParams = new URLSearchParams(window.location.search);
  const otp = queryParams.get('otp');
  const state = queryParams.get('state');
  const maxAge = queryParams.get('maxAge');
  const acrValues = queryParams.get('acrValues');

  useEffect(() => {
    if (!widgetRef.current) {
      return false;
    }

    const { issuer, clientId, redirectUri, scopes } = oidcConfig;
    const widget = new OktaSignIn({
      /**
       * Note: when using the Sign-In Widget for an OIDC flow, it still
       * needs to be configured with the base URL for your Okta Org. Here
       * we derive it from the given issuer for convenience.
       */
      baseUrl: issuer.split('/oauth2')[0],
      clientId,
      redirectUri,
      authParams: {
        // To avoid redirect do not set "pkce" or "display" here. OKTA-335945
        issuer,
        scopes,
        // config to bootstrap re-authentication for insufficient authentication scenario
        ...(maxAge && { maxAge }),
        ...(acrValues && { acrValues }),
      },
      useInteractionCodeFlow: true,
      ...(state && { state }),
      ...(otp && { otp }),
    });

    widget.renderEl(
      { el: widgetRef.current },
      (res) => {
        oktaAuth.tokenManager.setTokens(res.tokens);
        history.replace('/');
      },
      (err) => {
        throw err;
      },
    );

    return () => widget.remove();
  }, [oktaAuth, history, maxAge, acrValues, otp, state]);

  return (
    <div>
      <div ref={widgetRef} />
    </div>
  );
};

export default WidgetPage;
