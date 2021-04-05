// @ts-nocheck
/* eslint-disable no-console */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { ExpressOIDC } = require('@okta/oidc-middleware');

const templateDir = path.join(__dirname, '', 'views');
const frontendDir = path.join(__dirname, '', 'assets');

const sampleConfig = require('../config.js').webServer;

const oidc = new ExpressOIDC(Object.assign({
  issuer: sampleConfig.oidc.issuer,
  client_id: sampleConfig.oidc.clientId,
  client_secret: sampleConfig.oidc.clientSecret,
  appBaseUrl: sampleConfig.oidc.appBaseUrl,
  scope: sampleConfig.oidc.scope,
}, {}));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'this-should-be-very-random', 
  resave: true, 
  saveUninitialized: false
}));
app.use(passport.initialize({ userProperty: 'userContext' }));
app.use(passport.session());

// Provide the configuration to the view layer because we show it on the homepage
const displayConfig = Object.assign(
  {},
  sampleConfig.oidc,
  {
    clientSecret: '****' + sampleConfig.oidc.clientSecret.substr(sampleConfig.oidc.clientSecret.length - 4, 4)
  }
);

app.locals.oidcConfig = displayConfig;

// This server uses mustache templates located in views/ and css assets in assets/
app.use('/assets', express.static(frontendDir));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

app.get('/', (req, res) => {
  const userinfo = req.userContext && req.userContext.userinfo;
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo,
  });
});

app.use(require('./routes'));

app.post('/logout', 
  oidc.forceLogoutAndRevoke(), 
  (req, res) => {
    // Nothing here will execute, after the redirects the user will end up wherever the `routes.logoutCallback.path` specifies (default `/`)
  });

oidc.on('ready', () => {
  // eslint-disable-next-line no-console
  app.listen(sampleConfig.port, () => console.log(`App started on port ${sampleConfig.port}`));
});

oidc.on('error', err => {
  // An error occurred with OIDC
  // eslint-disable-next-line no-console
  console.error('OIDC ERROR: ', err);

  // Throwing an error will terminate the server process
  // throw err;
});
