const express = require('express');
const { 
  getAuthClient,
  handleAuthTransaction,
  redirect,
  renderTemplate,
  renderPage,
} = require('../utils');

const router = express.Router();

const BASE_PATH = '/recover-password';
const SUPPORTED_AUTHENTICATORS = ['email', 'phone'];


const proceed = ({ req, res, nextStep }) => {
  const { name, type, authenticators } = nextStep;

  switch (name) {
    case 'select-authenticator-authenticate':
      req.session.authenticators = authenticators;
      redirect({ req, res, path: `${BASE_PATH}/select-authenticator` });
      return true;
    case 'challenge-authenticator':
    case 'authenticator-verification-data':
      if (!SUPPORTED_AUTHENTICATORS.includes(type)) {
        return false;
      }
      redirect({ req, res, path: `${BASE_PATH}/challenge-authenticator/${type}` });
      return true;
    case 'reset-authenticator':
      redirect({ req, res, path: `${BASE_PATH}/reset` });
      return true;
    default:
      return false;
  }
};

// entry route
router.get('/recover-password', (req, res) => {
  const { authenticator } = req.query;
  renderTemplate(req, res, 'recover-password', {
    action: authenticator 
      ? `/recover-password?authenticator=${authenticator}` 
      : '/recover-password'
  });
});

router.post('/recover-password', async (req, res, next) => {
  const { authenticator } = req.query;
  const { identifier } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.recoverPassword({
    identifier,
    authenticators: authenticator ? [authenticator] : [],
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle reset password
router.get('/recover-password/reset', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      action: '/recover-password/reset'
    })
  });
});

router.post('/recover-password/reset', async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    // TODO: handle error in validation middleware
    next(new Error('Password not match'));
    return;
  }

  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.recoverPassword({ password });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle select-authenticator
router.get('/recover-password/select-authenticator', (req, res) => {
  const { authenticators } = req.session;
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/recover-password/select-authenticator',
    })
  });
});

router.post('/recover-password/select-authenticator', async (req, res, next) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.recoverPassword({
    authenticators: [authenticator],
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle email authenticator
router.get(`/recover-password/challenge-authenticator/email`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: `Challenge email authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/recover-password/challenge-authenticator/email',
    })
  });
});

router.post(`/recover-password/challenge-authenticator/email`, async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle phone (sms) authenticator
router.get(`/recover-password/challenge-authenticator/phone`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: `Challenge phone authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/recover-password/challenge-authenticator/phone',
    })
  });
});

router.post(`/recover-password/challenge-authenticator/phone`, async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.recoverPassword({ verificationCode });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

module.exports = router;
