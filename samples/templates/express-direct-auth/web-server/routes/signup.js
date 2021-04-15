const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

const authenticators = ['email', 'password']; // ordered authenticators

const handleAuthTransaction = (req, res, { authClient, authTransaction }) => {
  const { 
    stateHandle, 
    tokens, 
    data: { nextStep } 
  } = authTransaction;

  const next = () => {
    if (nextStep.name === 'enroll-authenticator') {
      res.redirect(`/signup/enroll-${nextStep.type}-authenticator`);
    } else {
      throw { errorCauses: ['Unhandlable next step.'] };
    }
  };
  const done = () => {
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  };

  // Done if tokens are available
  if (tokens) {
    return done();
  }
  // Persist stateHandle to session
  req.session.stateHandle = stateHandle;
  // Proceed to next step
  next(nextStep, res);
};

router.get('/signup', (_, res) => {
  res.render('registration');
});

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.register({ 
      firstName, 
      lastName, 
      email,
      authenticators,
    });
    handleAuthTransaction(req, res, { authClient, authTransaction });
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render('registration', {
      hasError: true,
      errors, 
    });
  }
});

router.get(`/signup/enroll-email-authenticator`, (req, res) => {
  const { stateHandle } = req.session;
  if (stateHandle) {
    res.render(`email-authenticator`, {
      title: 'Enroll email authenticator',
      action: '/signup/enroll-email-authenticator',
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-email-authenticator', async (req, res) => {
  try {
    const { emailVerificationCode } = req.body;
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.register({ 
      emailVerificationCode, 
      authenticators,
      stateHandle 
    });
    handleAuthTransaction(req, res, { authTransaction, authTransaction });
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render('email-authenticator', {
      title: 'Enroll email authenticator',
      hasError: true,
      errors, 
    });
  }
});

router.get(`/signup/enroll-password-authenticator`, (req, res) => {
  const { stateHandle } = req.session;
  if (stateHandle) {
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action: '/signup/enroll-password-authenticator',
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-password-authenticator', async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('enroll-or-reset-password-authenticator', {
      hasError: true,
      errors: ['Password not match']
    });
  }

  try {
    const { stateHandle } = req.session;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.register({ 
      password, 
      authenticators,
      stateHandle 
    });
    handleAuthTransaction(req, res, { authTransaction, authTransaction });
  } catch (err) {
    const errors = err.errorCauses ? err.errorCauses : ['Registration failed'];
    res.render(`enroll-or-reset-password-authenticator`, {
      title: 'Set up password',
      hasError: true,
      errors, 
    });
  }
});

module.exports = router;
