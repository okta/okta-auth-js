const CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
const ISSUER = process.env.ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;
const REDIRECT_URI = `${window.location.origin}/login/callback`;

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true
  },
  widget: {
    baseUrl: ISSUER.replace('/oauth2/default', ''),
    clientId: CLIENT_ID,
    redirectUri: window.location.origin + '/login/callback',
    authParams: {
      // If your app is configured to use the Implicit flow
      // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
      // you will need to uncomment the below line
      // pkce: false
    }
    // Additional documentation on config options can be found at https://github.com/okta/okta-signin-widget#basic-config-options
  }
};
