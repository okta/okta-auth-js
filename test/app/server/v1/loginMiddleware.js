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


const util = require('../../src/util');
const getAuthClient = require('../authClient');

module.exports = function loginMiddleware(req, res) {
  const issuer = req.body.issuer;
  const username = req.body.username;
  const password = req.body.password;
  let status = '';
  let sessionToken = '';
  let error = '';
  
  const authClient = getAuthClient({ issuer });
  authClient.signIn({
    username,
    password
  })
  .then(function(transaction) {
    status = transaction.status;
    sessionToken = transaction.sessionToken;
  })
  .catch(function(err) {
    error = err;
    console.error(error);
  })
  .finally(function() {
    const qs = util.toQueryString({
      status,
      sessionToken,
      error
    });
    res.redirect('/server' + qs);
  });
};
