/* global process, window, document, URL*/
import TestApp from './testApp';

/* eslint-disable prefer-destructuring */
const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;
/* eslint-enable prefer-destructuring */

const HOST = window.location.host;
const REDIRECT_URI = `http://${HOST}/implicit/callback`;

const config = {
  issuer: ISSUER,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
};

// Allow setting some values by URL params
const url = new URL(window.location.href);
const pkce = !!url.searchParams.get('pkce');
const scopes = (url.searchParams.get('scopes') || 'openid,email').split(',');
const responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
const maxClockSkew = parseInt(url.searchParams.get('maxClockSkew') || 300);
Object.assign(config, {
  pkce,
  scopes,
  responseType,
  maxClockSkew,
});

// Create the app as a function of config
const app = new TestApp(config);

// Expose for console fiddling
window._testApp = app;

// Bootstrap as a function of the URL path
const { pathname } = window.location;
app.mount(window, document.getElementById('root'), pathname);
