/* global process, window, document */

const TestApp = require('./testApp')(window, document);

/* eslint-disable prefer-destructuring */
const DOMAIN = process.env.DOMAIN;
const CLIENT_ID = process.env.CLIENT_ID;
/* eslint-enable prefer-destructuring */

const ISSUER = `https://${DOMAIN}/oauth2/default`;
const HOST = window.location.host;
const REDIRECT_URI = `http://${HOST}/implicit/callback`;

const config = {
  issuer: ISSUER,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
};

// Create the app as a function of config
const app = new TestApp(config);
window._testApp = app;

// Bootstrap as a function of the URL path
const { pathname } = window.location;
app.bootstrap(pathname);

