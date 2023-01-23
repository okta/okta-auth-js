const express = require('express');
const createProxyMiddleware = require('./proxyMiddleware');

// Proxy should use different (from your SPA) port or domain  to have different local/session storage.
// SIW initially clears transaction storage, so state saved in SPA could not be readen on login callback
//  and `handleRedirect` would produce the error:
// AuthSdkError: Could not load PKCE codeVerifier from storage. 
//  This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.
//
// Okta org setup:
// - Proxy URL should be added to Trusted Origins.
// - `<proxy>/login/callback` should be added to Redirect URIs of app with CLIENT_ID

module.exports = function createProxyApp({ proxyPort }) {
  const proxyApp = express();
  const { origin } = new URL(process.env.ISSUER);
  const proxyMiddleware = createProxyMiddleware({
    origin,
    proxyPort
  });
  proxyApp.use('/api', proxyMiddleware); // /api/v1/sessions/me
  proxyApp.use('/oauth2', proxyMiddleware); // /oauth2/v1
  proxyApp.use('/idp/idx', proxyMiddleware);
  proxyApp.use('/login/token/redirect', proxyMiddleware);
  proxyApp.use('/app', proxyMiddleware);
  proxyApp.use('/.well-known', proxyMiddleware);
  return proxyApp;
};
