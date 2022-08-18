/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


// @ts-nocheck
/* eslint-disable no-console */

const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { 
  userContext, 
  authTransaction,
  flowStates,
  oidcConfig,
} = require('./middlewares');

const templateDir = path.join(__dirname, '', 'views');
const frontendDir = path.join(__dirname, '', 'assets');
const authJSAssets = path.resolve(path.dirname(require.resolve('@okta/okta-auth-js/package.json')), 'build', 'dist');

const getConfig = require('../config.js');
const { port } = getConfig().webServer;

const app = express();
module.exports = app;

app.use(express.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'this-should-be-very-random', 
  resave: true, 
  saveUninitialized: false
}));
app.use(flowStates);
app.use(authTransaction);
app.use(oidcConfig);

// This server uses mustache templates located in views/ and css assets in assets/
app.use('/assets', express.static(frontendDir));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);
// okta-auth-js assets
app.use(express.static(authJSAssets));

app.use(userContext);

app.use(require('./routes'));

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, complexity
app.use(function(err, req, res, next) {
  if (err && err.stack) {
    console.error(err.stack);
  }
  let errors;
  if (Array.isArray(err.errorCauses) && err.errorCauses.length) {
    // handle error from SDK
    errors = err.errorCauses;
  } else if (typeof err === 'string') {
    errors = [err];
  } else if (err && err.message) {
    errors = [err.message];
  } else if (err && err.error_description) {
    errors = [err.error_description];
  } else if (err && err.errorSummary) {
    errors = [err.errorSummary];
  } else if (err && err.xhr) {
    errors = [err.xhr.responseJSON];
  } else if (err && err.messages && err.messages.value) {
    errors = err.messages.value.map(value => value.message);
  } else {
    errors = ['Internal Error!'];
  }

  res.status(500).render('error', { 
    hasError: true,
    errors 
  });
});

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use(function (req, res, next) {
  res.status(404).send('404');
});

app.listen(port, () => console.log(`App started on port ${port}`));
