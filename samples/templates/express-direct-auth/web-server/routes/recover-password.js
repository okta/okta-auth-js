const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

const authenticators = ['email']; // ordered authenticators

router.get('/recover-password', (req, res) => {
  res.render('recover-password');
});

router.post('/recover-password', async (req, res) => {
  const { identifier } = req.body;
  try {
    const authClient = getAuthClient(req);
    const { stateHandle } = await authClient.idx.recoverPassword({
      identifier,
      authenticators,
    });
    // Persist stateHandle to session
    req.session.stateHandle = stateHandle;
    // Proceed to email authenticator page
    res.redirect('/recover-password/challenge-email-authenticator');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render('recover-password', {
      hasError: true,
      errors, 
    });
  }
});

router.get(`/recover-password/challenge-email-authenticator`, (req, res) => {
  const { stateHandle } = req.session;
  if (stateHandle) {
    res.render('email-authenticator', {
      title: 'Challenge email authenticator',
      action: '/recover-password/challenge-email-authenticator',
    });
  } else {
    res.redirect('/recover-password');
  }
});

router.post('/recover-password/challenge-email-authenticator', async (req, res) => {
  try {
    const { emailVerificationCode } = req.body;
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue password recovery
    const authTransaction = await authClient.idx.recoverPassword({ 
      emailVerificationCode, 
      authenticators,
      stateHandle 
    });
    // Persist stateHandle to session
    req.session.stateHandle = authTransaction.stateHandle;
    // Proceed to password authenticator page
    res.redirect('/recover-password/reset-password');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Password recovery failed.'];
    res.render(`enroll-${authenticators[0]}-authenticator`, {
      hasError: true,
      errors, 
    });
  }
});

router.get('/recover-password/reset-password', (req, res) => {
  res.render('enroll-or-reset-password-authenticator', {
    title: 'Reset password',
    action: '/recover-password/reset',
  });
});

router.post('/recover-password/reset', async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      hasError: true,
      errors: ['Password not match']
    });
  }

  try {
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue registration
    const { tokens } = await authClient.idx.recoverPassword({ 
      password, 
      authenticators,
      stateHandle 
    });
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render(`enroll-or-reset-password-authenticator`, {
      title: 'Reset password',
      hasError: true,
      errors, 
    });
  }
});

module.exports = router;
