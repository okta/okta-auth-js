const express = require('express');
const { getAuthClient, uniqueId } = require('../utils');

const router = express.Router();

const authenticators = ['email', 'password']; // ordered authenticators

router.get('/signup', (_, res) => {
  res.render('registration');
});

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const transactionId = uniqueId();
    const authClient = getAuthClient({ 
      storageManager: {
        transaction: {
          storageKey: `transaction-${transactionId}`
        }
      }
    });
    // Start registration
    const { stateHandle } = await authClient.idx.registration({ 
      firstName, 
      lastName, 
      email,
      authenticators,
    });
    // Persist transactionId and stateHandle to session
    req.session.transactionId = transactionId;
    req.session.stateHandle = stateHandle;
    // Proceed to email authenticator page
    res.redirect('/signup/enroll-email-authenticator');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render('registration', {
      hasError: errors && errors.length,
      errors, 
    });
  }
});

router.get('/signup/enroll-email-authenticator', (req, res) => {
  const { stateHandle } = req.session;
  if (stateHandle) {
    res.render(`enroll-${authenticators[0]}-authenticator`);
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-email-authenticator', async (req, res) => {
  try {
    const { emailVerificationCode } = req.body;
    const { stateHandle, transactionId } = req.session;
    const authClient = getAuthClient({
      storageManager: {
        transaction: {
          storageKey: `transaction-${transactionId}`
        }
      }
    });
    // Continue registration
    const authTransaction = await authClient.idx.registration({ 
      emailVerificationCode, 
      authenticators,
      stateHandle 
    });
    // Persist stateHandle to session
    req.session.stateHandle = authTransaction.stateHandle;
    // Proceed to password authenticator page
    res.redirect('/signup/enroll-password-authenticator');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render(`enroll-${authenticators[0]}-authenticator`, {
      hasError: errors && errors.length,
      errors, 
    });
  }
});

router.get('/signup/enroll-password-authenticator', (req, res) => {
  const { stateHandle } = req.session;
  if (stateHandle) {
    res.render(`enroll-${authenticators[1]}-authenticator`);
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-password-authenticator', async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render(`enroll-${authenticators[1]}-authenticator`, {
      hasError: true,
      errors: ['Password not match']
    });
  }

  try {
    const { stateHandle, transactionId } = req.session;
    const authClient = getAuthClient({
      storageManager: {
        transaction: {
          storageKey: `transaction-${transactionId}`
        }
      }
    });
    // Continue registration
    const { tokens } = await authClient.idx.registration({ 
      password, 
      authenticators,
      stateHandle 
    });
    // Get userInfo with tokens
    const { tokens: { accessToken, idToken } } = tokens;
    const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
    // Persist userContext in session
    req.session.userContext = JSON.stringify({ userinfo, tokens: { accessToken, idToken } });
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render(`enroll-${authenticators[1]}-authenticator`, {
      hasError: errors && errors.length,
      errors, 
    });
  }
});

module.exports = router;
