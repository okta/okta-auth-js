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
const redirect = require('./redirect');

const proceed = ({ nextStep, req, res }) => {
  const { name, authenticator } = nextStep;
  const { key, displayName, type } = authenticator || {};

  // Stop if unsupported types detected
  if (authenticator && !Object.values(AuthenticatorKey).includes(key)) {
    throw new Error(`
      Authenticator: ${displayName} is not supported in current sample, 
      please extend the sample by adding handles for ${displayName} authenticator.
    `);
  }

  switch (name) {
    // authentication
    case 'identify':
      redirect({ req, res, path: '/login' });
      return true;

    // recover password
    case 'identify-recovery':
      redirect({ req, res, path: '/recover-password' });
      return true;
      
    // registration
    case 'enroll-profile':
      redirect({ req, res, path: '/register' });
      return true;

    // authenticator authenticate
    case 'select-authenticator-authenticate':
      redirect({ 
        req, res, path: '/select-authenticator'
      });
      return true;
    case 'challenge-authenticator':
      redirect({ 
        req, 
        res, 
        path: type === 'password' ? '/login' : `/challenge-authenticator/${key}` 
      });
      return true;
    case 'authenticator-verification-data':
      redirect({ req, res, path: `/verify-authenticator/${key}` });
      return true;

    // authenticator enrollment
    case 'select-authenticator-enroll':
      redirect({ req, res, path: '/select-authenticator' });
      return true;
    case 'enroll-authenticator':
      redirect({ req, res, path: `/enroll-authenticator/${key}` });
      return true;
    case 'authenticator-enrollment-data':
      redirect({ req, res, path: `/enroll-authenticator/${key}/enrollment-data` });
      return true;

    // reset password
    case 'reset-authenticator':
      redirect({ req, res, path: '/reset-password' });
      return true;
    default:
      return false;
  }
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
