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

// The request query should contain an interaction_code and state OR an error and error_description.
module.exports = function handleInteractionCode(req) {
  const interactionCode = req.query.interaction_code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, redirectUri, transactionId, clientSecret } = state;

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
    clientSecret
  });

  const meta = authClient.transactionManager.load();
  const { codeVerifier } = meta;
  return authClient.token.exchangeCodeForTokens({ interactionCode, codeVerifier });
};
