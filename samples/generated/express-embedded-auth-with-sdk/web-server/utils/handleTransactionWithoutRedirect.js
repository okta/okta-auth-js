/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { IdxStatus } = require('@okta/okta-auth-js');
const getNextRouteFromTransaction = require('./getNextRouteFromTransaction');
const sendJson = require('./sendJson');
const appendTransactionIdToPath = require('./appendTransactionIdToPath');

module.exports = function handleTransactionWithoutRedirect({ 
  req,
  res, 
  authClient, 
  transaction,
}) {
  const {  
    tokens,
    status,
  } = transaction;

  const { transactionId } = req;

  // Persist states to session
  req.setFlowStates({ idx: transaction });

  switch (status) {
    case IdxStatus.PENDING:
      if (!getNextRouteFromTransaction(transaction)) {
        res.status(500).send('Unable to determine next route');
      }

      sendJson(req, res, {
        ...transaction.nextStep,
        nextRoute: appendTransactionIdToPath(
          getNextRouteFromTransaction(transaction),
          transactionId),
      });
      return;
    case IdxStatus.SUCCESS:
      // Save tokens to storage (req.session)
      authClient.tokenManager.setTokens(tokens);
      // Redirect back to home page
      sendJson(req, res, {
        nextRoute: appendTransactionIdToPath('/', transactionId)
       });
      return;
    case IdxStatus.FAILURE:
      // Set next page to current location - error repsonse is saved in session
      // and should be rendered on page reload
      sendJson(req, res, {
        nextRoute: appendTransactionIdToPath(req.originalUrl, transactionId)
      });
      return;
    case IdxStatus.TERMINAL:
      sendJson(req, res, {
        nextRoute: appendTransactionIdToPath('/terminal', transactionId)
      });
      return;
    case IdxStatus.CANCELED:
      sendJson(req, res, {
        nextRoute: '/'
      });
      return;
  }
};
