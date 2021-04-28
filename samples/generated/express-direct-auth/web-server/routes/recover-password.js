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

const next = ({ req, res, nextStep }) => {
  const { name, type, authenticators } = nextStep;
  if (name === 'select-authenticator-authenticate') {
    req.session.authenticators = authenticators;
    redirect({ req, res, path: '/recover-password/select-authenticator' });
    return true;
  } else if (name === 'challenge-authenticator' 
      || name === 'authenticator-verification-data') {
    redirect({ req, res, path: `/recover-password/challenge-authenticator/${type}` });
    return true;
  } else if (name === 'reset-authenticator') {
    redirect({ req, res, path: '/recover-password/reset' });
    return true;
  }
  return false;
};

router.get('/recover-password', (req, res) => {
  const { authenticator } = req.query;
  const action = getFormActionPath(
    req, 
    authenticator 
      ? `/recover-password?authenticator=${authenticator}` 
      : '/recover-password'
  );
  res.render('recover-password', { action });
});

router.post('/recover-password', async (req, res) => {
  const { authenticator } = req.query;
  const { identifier } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.recoverPassword({
      identifier,
      authenticators: authenticator ? [authenticator] : [],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(
      req,
      authenticator 
        ? `/recover-password?authenticator=${authenticator}` 
        : '/recover-password'
    );
    renderError(res, {
      template: 'recover-password',
      action,
      error,
    });
  }
});

router.get('/recover-password/reset', (req, res) => {
  const action = getFormActionPath(req, '/recover-password/reset');
  res.render('enroll-or-reset-password-authenticator', {
    title: 'Reset password',
    action,
  });
});

router.post('/recover-password/reset', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({ password });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    const action = getFormActionPath(req, '/recover-password/reset');
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Reset password',
      action,
      error,
    });
  }
});

// Handle select-authenticator
router.get('/recover-password/select-authenticator', (req, res) => {
  const { status, authenticators } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/recover-password/select-authenticator');
    res.render('select-authenticator', {
      authenticators,
      action,
    });
  } else {
    redirect({ req, res, path: '/recover-password' });
  }
});

router.post('/recover-password/select-authenticator', async (req, res) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.recoverPassword({
      authenticators: [authenticator],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'select-authenticator',
      error,
    });
  }
});

// Handle email authenticator
router.get(`/recover-password/challenge-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/recover-password/challenge-authenticator/email');
    res.render('authenticator', {
      title: `Challenge email authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action,
    });
  } else {
    redirect({ req, res, path: '/recover-password' });
  }
});

router.post(`/recover-password/challenge-authenticator/email`, async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'authenticator',
      title: `Challenge email authenticator`,
      error,
    });
  }
});

// Handle phone (sms) authenticator
router.get(`/recover-password/challenge-authenticator/phone`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/recover-password/challenge-authenticator/phone');
    res.render('authenticator', {
      title: `Challenge phone authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action,
    });
  } else {
    redirect({ req, res, path: '/recover-password' });
  }
});

router.post(`/recover-password/challenge-authenticator/phone`, async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'authenticator',
      title: `Challenge phone authenticator`,
      error,
    });
  }
});

module.exports = router;
