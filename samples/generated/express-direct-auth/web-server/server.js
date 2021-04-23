// @ts-nocheck
/* eslint-disable no-console */

const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { userContext } = require('./middlewares');
const { getAuthClient } = require('./utils');

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

app.use(userContext);

app.use(require('./routes'));

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use(function(err, req, res, next) {
  console.error(err.stack);

  // Clear transaction meta
  const authClient = getAuthClient(req);
  authClient.transactionManager.clear();

  res.status(500).send('Internal Error!');
});

app.listen(port, () => console.log(`App started on port ${port}`));
