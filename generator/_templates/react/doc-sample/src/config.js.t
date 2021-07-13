---
to: ../generated/<%= dest %>/src/config.js
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

const CLIENT_ID = process.env.SPA_CLIENT_ID || process.env.CLIENT_ID || '{clientId}';
const ISSUER = process.env.ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
const REDIRECT_URI = `${window.location.origin}/login/callback`;
<% if (useSiw === 'true') { -%>
const USE_INTERACTION_CODE = process.env.USE_INTERACTION_CODE === 'true';
<% } -%>

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
  },
  widget: {
    baseUrl: ISSUER.replace('/oauth2/default', ''),
    clientId: CLIENT_ID,
    redirectUri: `${window.location.origin}/login/callback`,
<% if (useSiw === 'true') { -%>
    useInteractionCodeFlow: USE_INTERACTION_CODE,
<% } -%>
    authParams: {
      // If your app is configured to use the Implicit flow
      // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
      // you will need to uncomment the below line
      // pkce: false
    },
    // Additional documentation on config options can be found at https://github.com/okta/okta-signin-widget#basic-config-options
  },
};
