const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

const authenticators = ['email']; // ordered authenticators
// const authenticators = ['phone']; // ordered authenticators

const handleAuthTransaction = (req, res, { authClient, authTransaction }) => {
  const {  
    data: { 
      nextStep,
      interactionHandle,
      tokens,
    }
  } = authTransaction;

  const next = () => {
    if (nextStep.name === 'challenge-authenticator') {
      res.redirect(`/recover-password/challenge-${nextStep.type}-authenticator`);
    } else if (nextStep.name === 'reset-authenticator') {
      res.redirect('/recover-password/reset');
    } else {
      throw { errorCauses: ['Unable to handle next step.'] };
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

router.get('/recover-password', (req, res) => {
  res.render('recover-password');
});

router.post('/recover-password', async (req, res) => {
  const { identifier } = req.body;
  try {
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({
      identifier,
      authenticators,
    });
    handleAuthTransaction(req, res, { authClient, authTransaction });
  } catch (err) {
    const errors = err.errorCauses || [];
    res.render('recover-password', {
      hasError: true,
      errors, 
    });
  }
});

router.get(`/recover-password/challenge-email-authenticator`, (req, res) => {
  const { interactionHandle } = req.session;
  if (interactionHandle) {
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
    const { interactionHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue password recovery
    const authTransaction = await authClient.idx.recoverPassword({ 
      emailVerificationCode, 
      authenticators,
      interactionHandle 
    });
    handleAuthTransaction(req, res, { authClient, authTransaction });
  } catch (err) {
    const errors = err.errorCauses || [];
    res.render('email-authenticator', {
      title: 'Challenge email authenticator',
      hasError: true,
      errors, 
    });
  }
});

router.get('/recover-password/reset', (req, res) => {
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
    const { interactionHandle } = req.session;
    const authClient = getAuthClient(req);
    // Continue registration
    const authTransaction = await authClient.idx.recoverPassword({ 
      password, 
      authenticators,
      interactionHandle 
    });
    handleAuthTransaction(req, res, { authClient, authTransaction });
  } catch (err) {
    const errors = err.errorCauses || [];
    res.render(`enroll-or-reset-password-authenticator`, {
      title: 'Reset password',
      hasError: true,
      errors, 
    });
  }
});

module.exports = router;
