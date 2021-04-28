const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
  redirect,
  getFormActionPath,
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

router.get('/primary', (req, res) => {
  const action = getFormActionPath(req, '/login/primary');
  res.render('login-primary', { action });
});

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
    req.setLastError(error.message);
    const action = getFormActionPath(req, '/login/primary');
    renderTemplate(req, res, 'login-primary', { action });
  }
});

// Routes to handle expired password
router.get('/change-password', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    const action = getFormActionPath(req, '/login/change-password');
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Change password',
      action,
    });
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
    const action = getFormActionPath(req, '/login/change-password');
    req.setLastError(error.message);
    renderTemplate(
      req, 
      res, 
      'enroll-or-reset-password-authenticator', 
      { 
        title: 'Change password',
        action,
      }
    );
  }
});

module.exports = router;
