const express = require('express');
const { getAuthClient, renderError } = require('../utils');

const router = express.Router();

const authenticators = ['email', 'password']; // ordered authenticators

const handleAuthTransaction = (req, res, { authClient, authTransaction }) => {
  const { 
    interactionHandle, 
    tokens, 
    data: { 
      nextStep,
    },
  } = authTransaction;

  const next = () => {
    if (nextStep.name === 'enroll-authenticator') {
      res.redirect(`/signup/enroll-${nextStep.type}-authenticator`);
    } else {
      throw new Error('Unable to handle next step');
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
  // Persist interactionHandle to session
  req.session.interactionHandle = interactionHandle;
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
  } catch (error) {
    renderError(res, {
      template: 'registration',
      error,
    });
  }
});

router.get(`/signup/enroll-email-authenticator`, (req, res) => {
  const { interactionHandle } = req.session;
  if (interactionHandle) {
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
    const { interactionHandle } = req.session;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.register({ 
      emailVerificationCode, 
      authenticators,
      interactionHandle 
    });
    handleAuthTransaction(req, res, { authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'email-authenticator',
      title: 'Enroll email authenticator',
      error,
    });
  }
});

router.get(`/signup/enroll-password-authenticator`, (req, res) => {
  const { interactionHandle } = req.session;
  if (interactionHandle) {
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action: '/signup/enroll-password-authenticator',
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-password-authenticator', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const { interactionHandle } = req.session;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.register({ 
      password, 
      authenticators,
      interactionHandle 
    });
    handleAuthTransaction(req, res, { authTransaction, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Set up password',
      error,
    });
  }
});

module.exports = router;
