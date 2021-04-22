const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  renderError, 
  handleAuthTransaction,
} = require('../utils');

const router = express.Router();

const authenticators = ['email', 'password']; // ordered authenticators

const next = (nextStep, res) => {
  const { name, type } = nextStep;
  if (name === 'enroll-authenticator') {
    res.redirect(`/signup/enroll-${type}-authenticator`);
    return true;
  }
  return false;
};

router.get('/signup', (_, res) => {
  res.render('registration');
});

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      firstName, 
      lastName, 
      email,
      authenticators,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'registration',
      error,
    });
  }
});

router.get(`/signup/enroll-email-authenticator`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('email-authenticator', {
      title: 'Enroll email authenticator',
      action: '/signup/enroll-email-authenticator',
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-email-authenticator', async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      verificationCode, 
      authenticators,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'email-authenticator',
      title: 'Enroll email authenticator',
      error,
    });
  }
});

router.get(`/signup/enroll-password-authenticator`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
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
  const authClient = getAuthClient(req);
  try {
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const authTransaction = await authClient.idx.register({ 
      password, 
      authenticators,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Set up password',
      error,
    });
  }
});

module.exports = router;
