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


/* eslint-disable no-console */

require('@okta/env').setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

const { 
  CLIENT_ID,
  ISSUER,
} = process.env;

const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');

const app = express();
const port = '8080';

// preserves query parameters
// function redirectToOrigin(req, res, next) {
//   req.url = '/';
//   next();
// }

// console.log('Login Redirect URI: {{ redirectPath }}');
// app.get('{{ redirectPath }}', redirectToOrigin);

// app.use(express.static('./public')); // app html

const templateDir = path.join(__dirname, '', 'guides');

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

function renderGuide(res) {
  res.render('guide', {
    siwVersion: '{{ siwVersion }}',
    baseUrl: ISSUER.split('/oauth2')[0],
    clientId: CLIENT_ID,
    redirectUri: `http://localhost:${port}{{ redirectPath }}`
  });
}

app.get('/', (req, res) => {
  renderGuide(res);
});

app.get('{{ redirectPath }}', (req, res) => {
  renderGuide(res);
});

app.listen(port, function () {
  console.log(`Test app running at http://localhost:${port}!\n`);
});
