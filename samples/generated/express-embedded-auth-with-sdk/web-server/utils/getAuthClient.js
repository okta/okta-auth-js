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


const OktaAuth = require('@okta/okta-auth-js').OktaAuth;

module.exports = function getAuthClient(req, options = {}) {
  const { transactionId } = req; // set by authTransaction middleware
  const { oidcConfig: oidc } = req.session.transactions[transactionId];

  if (process.env.NODE_ENV === 'test' 
      && oidc.clientId === process.env.CLIENT_ID 
      && !['/', '/logout'].includes(req.url)) {
    console.group('\x1b[36m%s\x1b[0m', 'TEST_ENV CLIENT LEAK DETECTED');
    console.log('ClientID:', oidc.clientId); 
    console.log('Request Url:', req.url);
    console.groupEnd();
  }
  
  const storageProvider = {
    getItem: function(key) {
      let val = req.session[key] || null;
      if (val) {
        try {
          val = JSON.parse(req.session[key]);
        } catch (err) {
          val = null;
        }
      }
      return val;
    },
    setItem: function(key, val) {
      req.session[key] = JSON.stringify(val);
    },
    removeItem: function(key) {
      delete req.session[key];
    }
  };

  let authClient;
  try {
    authClient = new OktaAuth({ 
      ...oidc,
      state: transactionId,
      storageManager: {
        token: {
          storageProvider
        },
        transaction: {
          storageKey: `transaction-${transactionId}`, // unique storage per transaction
          storageProvider
        }
      },
      ...options
    });
    
  } catch(e) {
    console.error('Caught exception in OktaAuth constructor: ', e);
  }
  return authClient;
};
