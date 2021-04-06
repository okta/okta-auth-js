// @ts-nocheck
/* eslint-disable no-console */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mustacheExpress = require('mustache-express');
const path = require('path');

const templateDir = path.join(__dirname, '', 'views');
const frontendDir = path.join(__dirname, '', 'assets');

const { oidc, port } = require('../config.js').webServer;

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
  oidc,
  {
    clientSecret: '****' + oidc.clientSecret.substr(oidc.clientSecret.length - 4, 4)
  }
);

app.locals.oidcConfig = displayConfig;

// This server uses mustache templates located in views/ and css assets in assets/
app.use('/assets', express.static(frontendDir));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

app.use(require('./routes'));

app.listen(port, () => console.log(`App started on port ${port}`));
