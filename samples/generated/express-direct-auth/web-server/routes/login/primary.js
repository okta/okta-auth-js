const express = require('express');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
} = require('../../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name } = nextStep;
  if (name === 'reenroll-authenticator') {
    res.redirect('/login/change-password');
    return true;
  }
  return false;
};

router.get('/primary', (req, res) => {
  res.render('login-primary');
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
    renderTemplate(req, res, 'login-primary');
  }
});

// Routes to handle expired password
router.get('/change-password', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Change password',
      action: '/login/change-password',
    });
  } else {
    res.redirect('/login/primary');
  }
});

router.post('/change-password', async (req, res) => {
  const { password: newPassword } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ newPassword });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error.message);
    renderTemplate(
      req, 
      res, 
      'enroll-or-reset-password-authenticator', 
      { title: 'Change password' }
    );
  }
});

module.exports = router;
