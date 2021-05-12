const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
  redirect,
} = require('../../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  const { name } = nextStep;
  switch (name) {
    case 'identify':
      redirect({ req, res, path: '/login/basic' });
      return true;
    case 'reenroll-authenticator':
      redirect({ req, res, path: '/login/change-password' });
      return true;
    default:
      return false;
  }
};
const renderLoginForm = (req, res) => {
  renderTemplate(req, res, 'basic-login', { 
    action: '/login/basic'
  });
};

router.get('/basic', renderLoginForm);

router.post('/basic', async (req, res, next) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ 
    username, 
    password,
  });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Routes to handle expired password
const renderChangePassword = (req, res) => {
  renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
    title: 'Change password',
    action: '/login/change-password',
  });
};

router.get('/change-password', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderChangePassword(req, res);
  } else {
    redirect({ req, res, path: '/login/basic' });
  }
});

router.post('/change-password', async (req, res, next) => {
  const { password: newPassword } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.authenticate({ newPassword });
  handleAuthTransaction({ req, res, next, authClient, authTransaction, proceed });
});

module.exports = router;
