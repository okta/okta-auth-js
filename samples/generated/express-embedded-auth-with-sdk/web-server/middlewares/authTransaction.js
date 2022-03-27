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


const crypto = require('crypto');

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = function authTransaction(req, res, next) {
  const { transactionId, state } = req.query;
  const id = transactionId || state || uniqueId();

  // initial transactions in session
  req.session.transactions = req.session.transactions || {};
  // remove empty transactions
  Object.keys(req.session.transactions).forEach(id => {
    const value = req.session.transactions[id];
    if (!Object.keys(value).length) {
      delete req.session.transactions[id];
    }
  });
  // add new transaction to session
  if (!req.session.transactions[id]) {
    req.session.transactions[id] = {};
  }

  // attach transactionId to req
  req.transactionId = id;

  next();
};
