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


const uniqueId = require('./util').uniqueId;
const getAuthClient = require('./authClient');
const toQueryString = require('../src/util').toQueryString;

module.exports = function loginMiddleware(req, res) {
  console.log('loginMiddleware received form data:', req.body, req.query, req.url, req.originalUrl);
  const username = req.body.username;
  const password = req.body.password;
  const transactionId = req.body.transactionId || uniqueId();

  const config = JSON.parse(req.body.config);
  const issuer = config.issuer;
  const clientId = config.clientId;
  const redirectUri = config.redirectUri;
  const scopes = config.scopes;
  const responseType = config.responseType;
  const clientSecret = config.clientSecret;
  const useClassicEngine = config.useClassicEngine;

  let status = '';
  let sessionToken = '';
  let error = '';
  
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
    clientSecret,
    useClassicEngine
  });

  authClient.signIn({ username, password })
  .then(function(transaction) {
    console.log('TRANSACTION', JSON.stringify(transaction.data, null, 2));
    status = transaction.status;
    sessionToken = transaction.sessionToken;
  })
  .catch(function(err) {
    error = err;
    console.error('loginMiddleware caught error: ', error, JSON.stringify(error, null, 2));
  })
  .finally(function() {
    const qs = toQueryString(Object.assign({}, config, {
      status,
      sessionToken,
      error: JSON.stringify(error, null, 2)
    }));
    console.log('Reloading the page. STATUS=', status);
    res.redirect('/server' + qs);
  });
};
