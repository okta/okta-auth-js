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


const getAuthClient = require('./authClient');
const uniqueId = require('./util').uniqueId;

module.exports = function widgetMiddleware(req, res) {

  const query = req.query;

  const transactionId = req.query.transactionId || uniqueId();
  const issuer = query.issuer;
  const clientId = query.clientId;
  const redirectUri = query.redirectUri;
  const scopes = query.scopes.split(',');
  const responseType = query.responseType;
  const useClassicEngine = query.useClassicEngine;
  const clientSecret = query.clientSecret;

  const authClient = getAuthClient({
    // Each transaction needs unique storage, there may be several clients
    storageManager: {
      transaction: {
        storageKey: 'transaction-' + transactionId
      }
    },
    issuer,
    clientId,
    redirectUri,
    scopes,
    responseType,
    useClassicEngine
  });

  console.log('OPTIONS', authClient.options);
  const state = JSON.stringify({ issuer, clientId, redirectUri, transactionId, clientSecret }).replace(/"/g, '\\"');
  authClient.idx.interact({ state })
    .then(idxRes => {
      const interactionHandle = idxRes.interactionHandle;
      const codeChallenge = idxRes.meta.codeChallenge;
      const codeChallengeMethod = idxRes.meta.codeChallengeMethod;
      const html = `
        <html>
          <head>
            <link rel="stylesheet" href="/oidc-app.css"/>
            <script src="/oidc-app.js"></script>
          </head>
          <body class="web-app login">
            <script type="text/javascript">
              renderWidget(null, {
                redirect: "always",
                state: "${state}",
                scopes: ${JSON.stringify(scopes)},
                interactionHandle: "${interactionHandle}",
                codeChallenge: "${codeChallenge}",
                codeChallengeMethod: "${codeChallengeMethod}"
              });
            </script>
          </body>
      `;
      res.send(html);
    })
    .catch(err => {
      console.error(err);
      const html = `
        <html>
          <body class="web-app login error">
            ${JSON.stringify(err, null, 2)}
          </body>
      `;
      res.send(html);
    });
};
