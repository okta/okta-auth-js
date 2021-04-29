const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient,
  handleAuthTransaction,
  redirect,
  renderTemplate,
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

const renderRecoverPassword = (req, res) => {
  const { authenticator } = req.query;
  renderTemplate(req, res, 'recover-password', {
    action: authenticator 
      ? `/recover-password?authenticator=${authenticator}` 
      : '/recover-password'
  });
};

router.get('/recover-password', renderRecoverPassword);

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
    req.setLastError(error);
    renderRecoverPassword(req, res);
  }
});

// Handle reset password
const renderResetPassword = (req, res) => {
  renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
    title: 'Reset password',
    action: '/recover-password/reset'
  });
};

router.get('/recover-password/reset', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderResetPassword(req, res);
  } else {
    redirect({ req, res, path: '/recover-password' });
  }
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
    req.setLastError(error);
    renderResetPassword(req, res);
  }
});

// Handle select-authenticator
const renderSelectAuthenticator = (req, res) => {
  const { authenticators } = req.session;
  renderTemplate(req, res, 'select-authenticator', {
    authenticators,
    action: '/recover-password/select-authenticator',
  });
};

router.get('/recover-password/select-authenticator', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderSelectAuthenticator(req, res);
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
    req.setLastError(error);
    renderSelectAuthenticator(req, res);
  }
});

// Handle email authenticator
const renderChallengeEmailAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: `Challenge email authenticator`,
    input: {
      type: 'text',
      name: 'verificationCode',
    },
    action: '/recover-password/challenge-authenticator/email',
  });
};

router.get(`/recover-password/challenge-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderChallengeEmailAuthenticator(req, res);
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
    req.setLastError(error);
    renderChallengeEmailAuthenticator(req, res);
  }
});

// Handle phone (sms) authenticator
const renderChallengePhoneAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: `Challenge phone authenticator`,
    input: {
      type: 'text',
      name: 'verificationCode',
    },
    action: '/recover-password/challenge-authenticator/phone',
  });
};

router.get(`/recover-password/challenge-authenticator/phone`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderChallengePhoneAuthenticator(req, res);
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
    req.setLastError(error);
    renderChallengePhoneAuthenticator(req, res);
  }
});

module.exports = router;
