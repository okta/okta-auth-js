const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
  redirect,
} = require('../../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name } = nextStep;
  if (name === 'reenroll-authenticator') {
    redirect({ req, res, path: '/login/change-password' });
    return true;
  }
  return false;
};

const renderLoginForm = (req, res) => {
  renderTemplate(req, res, 'login-primary', { 
    action: '/login/primary'
  });
};

router.get('/primary', renderLoginForm);

router.post('/primary', async (req, res) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ 
      username, 
      password,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderLoginForm(req, res);
  }
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
    redirect({ req, res, path: '/login/primary' });
  }
});

router.post('/change-password', async (req, res) => {
  const { password: newPassword } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ newPassword });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderChangePassword(req, res);
  }
});

module.exports = router;
