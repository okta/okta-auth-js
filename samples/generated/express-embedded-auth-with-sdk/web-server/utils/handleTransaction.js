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
const { IdxStatus, AuthenticatorKey } = require('@okta/okta-auth-js');
const getNextRouteFromTransaction = require('./getNextRouteFromTransaction');
const redirect = require('./redirect');

const proceed = ({ nextStep, req, res }) => {
  const { authenticator } = nextStep;
  const { key, displayName } = authenticator || {};

  // Stop if unsupported types detected
  if (authenticator && !Object.values(AuthenticatorKey).includes(key)) {
    throw new Error(`
      Authenticator: ${displayName} is not supported in current sample, 
      please extend the sample by adding handles for ${displayName} authenticator.
    `);
  }

  const nextRoute = getNextRouteFromTransaction({ nextStep });
  if (nextRoute) {
    redirect({ req, res, path: nextRoute});
    return true;
  }
  return false;
};

module.exports = function handleTransaction({ 
  req,
  res, 
  next, 
  authClient, 
  transaction,
}) {
  const {  
    nextStep,
    tokens,
    status,
    error,
  } = transaction;

  // Persist states to session
  req.setFlowStates({ idx: transaction });

  switch (status) {
    case IdxStatus.PENDING:
      // Proceed to next step
      try {
        if (!proceed({ req, res, nextStep })) {
          next(new Error(`
            Oops! The current flow cannot support the policy configuration in your org.
          `));
        }
      } catch (err) {
        next(err);
      }
      return;
    case IdxStatus.SUCCESS:
      // Save tokens to storage (req.session)
      authClient.tokenManager.setTokens(tokens);
      // Redirect back to home page
      res.redirect('/');
      return;
    case IdxStatus.FAILURE:
      authClient.transactionManager.clear();
      next(error);
      return;
    case IdxStatus.TERMINAL:
      redirect({ req, res, path: '/terminal' });
      return;
    case IdxStatus.CANCELED:
      res.redirect('/');
      return;
  }
};
