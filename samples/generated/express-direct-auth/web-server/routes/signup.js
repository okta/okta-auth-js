const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  renderError, 
  handleAuthTransaction,
  redirect,
  getFormActionPath,
} = require('../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name, type, authenticators, canSkip } = nextStep;
  // Always reset canSkip to false before redirect
  req.session.canSkip = false;
  if (name === 'select-authenticator-enroll') {
    req.session.canSkip = canSkip;
    req.session.authenticators = authenticators;
    redirect({ req, res, path: '/signup/select-authenticator' });
    return true;
  } else if (name === 'enroll-authenticator') {
    redirect({ req, res, path: `/signup/enroll-authenticator/${type}` });
    return true;
  }
  return false;
};

router.get('/signup', (req, res) => {
  const action = getFormActionPath(req, '/signup');
  res.render('enroll-profile', { action });
});

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      firstName, 
      lastName, 
      email,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(req, '/signup');
    renderError(res, {
      template: 'enroll-profile',
      action,
      error,
    });
  }
});

// Handle select-authenticator
router.get('/signup/select-authenticator', (req, res) => {
  const { status, authenticators, canSkip } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/signup/select-authenticator');
    const skipAction = getFormActionPath(req, '/signup/select-authenticator/skip');
    res.render('select-authenticator', {
      authenticators,
      action,
      skipAction,
      canSkip,
    });
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/select-authenticator', async (req, res) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({
      authenticators: [authenticator],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(req, '/signup/select-authenticator');
    renderError(res, {
      template: 'select-authenticator',
      action,
      error,
    });
  }
});

// Handle enroll authenticator -- email
router.get(`/signup/enroll-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/signup/enroll-authenticator/email');
    res.render('authenticator', {
      title: 'Enroll email authenticator',
      action,
      input: {
        type: 'text',
        name: 'verificationCode',
      }
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-authenticator/email', async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      verificationCode,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(req, '/signup/enroll-authenticator/email');
    renderError(res, {
      template: 'authenticator',
      title: 'Enroll email authenticator',
      action,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      error,
    });
  }
});

// Handle enroll authenticator -- password
router.get(`/signup/enroll-authenticator/password`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/signup/enroll-authenticator/password');
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action,
    });
  } else {
    res.redirect('/signup');
  }
});

router.post('/signup/enroll-authenticator/password', async (req, res) => {
  const { password, confirmPassword } = req.body;
  const authClient = getAuthClient(req);
  try {
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const authTransaction = await authClient.idx.register({ 
      password,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(req, '/signup/enroll-authenticator/password');
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Set up password',
      action,
      error,
    });
  }
});

module.exports = router;
