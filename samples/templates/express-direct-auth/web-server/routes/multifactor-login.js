const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
  redirect,
} = require('../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  const { name, type, authenticators } = nextStep;
  switch (name) {
    case 'identify':
      redirect({ req, res, path: '/multifactor-login' });
      return true;
    case 'select-authenticator-authenticate':
      req.session.authenticators = authenticators;
      redirect({ 
        req, 
        res, 
        path: '/multifactor-login/select-authenticator' 
      });
      return true;
    case 'challenge-authenticator':
      redirect({ 
        req, 
        res, 
        path: `/multifactor-login/challenge-authenticator/${type}` 
      });
      return true;
    default:
      return false;
  }
};

router.get('/multifactor-login', (req, res) => {
  const { authenticator } = req.query;
  renderTemplate(req, res, 'identify', { 
    action: authenticator 
      ? `/multifactor-login?authenticator=${authenticator}` 
      : `/multifactor-login`
  });
});

router.post('/multifactor-login', async (req, res, next) => {
  const { authenticator } = req.query;
  const { username } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ 
    username,
    authenticators: authenticator ? [authenticator] : [],
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle select-authenticator
router.get('/multifactor-login/select-authenticator', (req, res) => {
  const { status, authenticators } = req.session;
  if (status === IdxStatus.PENDING) {
    renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/multifactor-login/select-authenticator',
    });
  } else {
    redirect({ req, res, path: '/multifactor-login' });
  }
});

router.post('/multifactor-login/select-authenticator', async (req, res, next) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({
    authenticators: [authenticator],
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle email authenticator
router.get('/multifactor-login/challenge-authenticator/email', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderTemplate(req, res, 'authenticator', {
      title: 'Challenge email authenticator',
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/multifactor-login/challenge-authenticator/email',
    });
  } else {
    redirect({ req, res, path: '/multifactor-login' });
  }
});

router.post('/multifactor-login/challenge-authenticator/email', async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ verificationCode });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});  

// Handle password authenticator
router.get('/multifactor-login/challenge-authenticator/password', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderTemplate(req, res, 'authenticator', {
      title: 'Challenge password authenticator',
      input: {
        type: 'password',
        name: 'password',
      },
      action: '/multifactor-login/challenge-authenticator/password',
    });
  } else {
    redirect({ req, res, path: '/multifactor-login' });
  }
});

router.post('/multifactor-login/challenge-authenticator/password', async (req, res, next) => {
  const { password } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ password });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

module.exports = router;
