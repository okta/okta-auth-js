const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

const authenticators = ['email', 'password']; // ordered authenticators

router.get('/signup', (_, res) => {
  res.render('registration');
});

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const authClient = getAuthClient(req);
    // Start registration
    const { stateHandle } = await authClient.idx.register({ 
      firstName, 
      lastName, 
      email,
      authenticators,
    });
    // Persist stateHandle to session
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

// Handle get request for each authenticator enroll page
authenticators.forEach(authenticator => {
  router.get(`/signup/enroll-${authenticator}-authenticator`, (req, res) => {
    const { stateHandle } = req.session;
    if (stateHandle) {
      res.render(`enroll-${authenticator}-authenticator`);
    } else {
      res.redirect('/signup');
    }
  });
});

router.post('/signup/enroll-email-authenticator', async (req, res) => {
  try {
    const { emailVerificationCode } = req.body;
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue registration
    const authTransaction = await authClient.idx.register({ 
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

router.post('/signup/enroll-password-authenticator', async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render(`enroll-${authenticators[1]}-authenticator`, {
      hasError: true,
      errors: ['Password not match']
    });
  }

  try {
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue registration
    const { tokens } = await authClient.idx.register({ 
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
