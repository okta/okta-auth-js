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


/* eslint-disable complexity */
const { IdxStatus } = require('@okta/okta-auth-js');

module.exports = function handleTransaction({ 
  req,
  res, 
  next, 
  authClient, 
  transaction,
  proceed,
}) {
  const {  
    nextStep,
    tokens,
    status,
    error,
  } = transaction;

  // Persist states to session
  req.setIdxStates(transaction);

  switch (status) {
    case IdxStatus.PENDING:
      // Proceed to next step
      if (!proceed({ req, res, nextStep })) {
        next(new Error(`
          Oops! The current flow cannot support the policy configuration in your org, 
          try other flows in the sample or change your app/org configuration.
        `));
      }
      return;
    case IdxStatus.SUCCESS:
      // Save tokens to storage (req.session)
      authClient.tokenManager.setTokens(tokens);
      // Redirect back to home page
      res.redirect('/profile');
      return;
    case IdxStatus.FAILURE:
      authClient.transactionManager.clear();
      next(error);
      return;
    case IdxStatus.TERMINAL:
      res.redirect('/terminal');
      return;
    case IdxStatus.CANCELED:
      res.redirect('/');
      return;
  }
};
