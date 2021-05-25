/* eslint-disable complexity */
const { IdxStatus } = require('@okta/okta-auth-js');
const redirect = require('./redirect');

const SUPPORTED_AUTHENTICATORS = ['email', 'password', 'phone'];

const proceed = ({ nextStep, req, res }) => {
  const { name, type, authenticators, canSkip } = nextStep;

  // Always reset canSkip to false before redirect
  req.session.canSkip = false;

  // Stop if unsupported types detected
  if (type && !SUPPORTED_AUTHENTICATORS.includes(type)) {
    throw new Error(`
      Authenticator: ${type} is not supported in current sample, 
      please extend the sample by adding handles for ${type} authenticator.
    `);
  }

  switch (name) {
    // authentication
    case 'identify':
      redirect({ req, res, path: '/login' });
      return true;

    // recover password
    case 'identify-recovery':
      redirect({ req, res, path: '/recover-password' })
      return true;
      
    // registration
    case 'enroll-profile':
      redirect({ req, res, path: '/register' });
      return true;

    // authenticator authenticate
    case 'select-authenticator-authenticate':
      req.session.authenticators = authenticators;
      redirect({ 
        req, res, path: '/select-authenticator'
      });
      return true;
    case 'challenge-authenticator':
      redirect({ 
        req, 
        res, 
        path: type === 'password' ? '/login' : `/challenge-authenticator/${type}` 
      });
      return true;
    case 'authenticator-verification-data':
      redirect({ req, res, path: `/challenge-authenticator/${type}` });
      return true;

    // authenticator enrollment
    case 'select-authenticator-enroll':
      req.session.canSkip = canSkip;
      req.session.authenticators = authenticators;
      redirect({ req, res, path: '/select-authenticator' });
      return true;
    case 'enroll-authenticator':
      redirect({ req, res, path: `/enroll-authenticator/${type}` });
      return true;
    case 'authenticator-enrollment-data':
      redirect({ req, res, path: `/enroll-authenticator/${type}/enrollment-data` });
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
  req.setIdxStates(transaction);

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
      res.redirect('/terminal');
      return;
    case IdxStatus.CANCELED:
      res.redirect('/');
      return;
  }
};
