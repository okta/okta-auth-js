const express = require('express');
const createProxyMiddleware = require('./proxyMiddleware');

module.exports = function createProxyApp({ proxyPort }) {
	// Proxy should use another port or domain to have different local/session storage.
	// SIW initially clears transaction storage, so state could not be readen on login callback.
	// AuthSdkError: Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.
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
