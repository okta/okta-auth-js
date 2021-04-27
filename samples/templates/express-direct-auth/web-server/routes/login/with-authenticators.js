const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  handleAuthTransaction,
  renderTemplate,
} = require('../../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name, type, authenticators } = nextStep;
  if (name === 'select-authenticator-authenticate') {
    req.session.authenticators = authenticators;
    res.redirect('/login/with-authenticators/select-authenticator');
    return true;
  } else if (name === 'challenge-authenticator') {
    res.redirect(`/login/with-authenticators/challenge-authenticator/${type}`);
    return true;
  }
  return false;
};

router.get('/with-authenticators', (req, res) => {
  const { authenticator } = req.query;
  res.render('identify', {
    action: authenticator 
      ? `/login/with-authenticators?authenticator=${authenticator}` 
      : '/login/with-authenticators'
  });
});

router.post('/with-authenticators', async (req, res) => {
  const { authenticator } = req.query;
  const { username } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ 
      username,
      authenticators: authenticator ? [authenticator] : [],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error.message);
    renderTemplate(req, res, 'identify');
  }
});

// Handle select-authenticator
router.get('/with-authenticators/select-authenticator', (req, res) => {
  const { status, authenticators } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('select-authenticator', {
      authenticators,
      action: '/login/with-authenticators/select-authenticator',
    });
  } else {
    res.redirect('/login/with-authenticators');
  }
});

router.post('/with-authenticators/select-authenticator', async (req, res) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({
      authenticators: [authenticator],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template,
      error,
    });
  }
});

// Handle email authenticator
router.get(`/with-authenticators/challenge-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('authenticator', {
      title: `Challenge email authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: `/login/with-authenticators/challenge-authenticator/email`,
    });
  } else {
    res.redirect('/login/with-authenticators/');
  }
});

router.post(`/with-authenticators/challenge-authenticator/email`, async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template,
      title: `Challenge email authenticator`,
      error,
    });
  }
});  

// Handle password authenticator
router.get(`/with-authenticators/challenge-authenticator/password`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('authenticator', {
      title: `Challenge password authenticator`,
      input: {
        type: 'password',
        name: 'password',
      },
      action: `/login/with-authenticators/challenge-authenticator/password`,
    });
  } else {
    res.redirect('/login/with-authenticators/');
  }
});

router.post(`/with-authenticators/challenge-authenticator/password`, async (req, res) => {
  const { password } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ password });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template,
      title: `Challenge password authenticator`,
      error,
    });
  }
});

module.exports = router;
