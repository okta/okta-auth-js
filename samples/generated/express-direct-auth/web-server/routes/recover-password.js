const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  renderError, 
  handleAuthTransaction, 
} = require('../utils');

const router = express.Router();

const next = (nextStep, res) => {
  const { name, type } = nextStep;
  if (name === 'challenge-authenticator' 
      || name === 'authenticator-verification-data') {
    res.redirect(`/recover-password/challenge-${type}-authenticator`);
    return true;
  } else if (name === 'reset-authenticator') {
    res.redirect('/recover-password/reset');
    return true;
  }
  return false;
};

router.get('/recover-password', (req, res) => {
  res.render('recover-password');
});

router.post('/recover-password', async (req, res) => {
  const { authenticator = 'email' } = req.query;
  const { identifier } = req.body;
  try {
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({
      identifier,
      authenticators: [authenticator],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'recover-password',
      error,
    });
  }
});

router.get(`/recover-password/challenge-email-authenticator`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
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
    const { verificationCode } = req.body;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'email-authenticator',
      title: 'Challenge email authenticator',
      error,
    });
  }
});

router.get(`/recover-password/challenge-phone-authenticator`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('authenticator', {
      title: 'Challenge phone authenticator',
      action: '/recover-password/challenge-phone-authenticator',
    });
  } else {
    res.redirect('/recover-password');
  }
});

router.post('/recover-password/challenge-phone-authenticator', async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'authenticator',
      title: 'Challenge phone authenticator',
      error,
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
  try {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const authClient = getAuthClient(req);
    const authTransaction = await authClient.idx.recoverPassword({ password });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Reset password',
      error,
    });
  }
});

module.exports = router;
