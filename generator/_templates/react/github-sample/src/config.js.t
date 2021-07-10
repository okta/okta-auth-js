---
to: ../generated/<%= dest %>/src/config.js
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

const CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
const ISSUER = process.env.ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;
const REDIRECT_URI = `${window.location.origin}/login/callback`;
<% if (useSiw === 'true') { -%>
const USE_INTERACTION_CODE = process.env.USE_INTERACTION_CODE === 'true' || false;
<% } -%>

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
<% if (useSiw === 'true') { -%>
    useInteractionCode: USE_INTERACTION_CODE,
<% } -%>
  },
  resourceServer: {
    messagesUrl: 'http://localhost:8000/api/messages',
  },
};
