const express = require('express');
const { 
  getAuthClient, 
  renderError, 
  handleAuthTransaction, 
} = require('../utils');
const { 
  generateSelectAuthenticator, 
  generateChallengeAuthenticator, 
} = require('../routeUtils');

const router = express.Router();

const next = ({ req, res, nextStep }) => {
  const { name, type, authenticators } = nextStep;
  if (name === 'select-authenticator-authenticate') {
    req.session.authenticators = authenticators;
    res.redirect('/recover-password/select-authenticator');
    return true;
  } else if (name === 'challenge-authenticator' 
      || name === 'authenticator-verification-data') {
    res.redirect(`/recover-password/challenge-authenticator/${type}`);
    return true;
  } else if (name === 'reset-authenticator') {
    res.redirect('/recover-password/reset');
    return true;
  }
  return false;
};

router.get('/recover-password', (req, res) => {
  const { authenticator } = req.query;
  res.render('recover-password', {
    action: authenticator 
      ? `/recover-password?authenticator=${authenticator}` 
      : '/recover-password'
  });
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
    renderError(res, {
      template: 'recover-password',
      action: authenticator 
        ? `/recover-password?authenticator=${authenticator}` 
        : '/recover-password',
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

generateSelectAuthenticator({ 
  path: '/recover-password/select-authenticator', 
  entryPath: '/recover-password',
  next, 
  router,
});
['email', 'phone'].forEach(type => 
  generateChallengeAuthenticator({ 
    path: `/recover-password/challenge-authenticator/${type}`,
    entryPath: '/recover-password',
    type, 
    next, 
    router, 
  }));


module.exports = router;
