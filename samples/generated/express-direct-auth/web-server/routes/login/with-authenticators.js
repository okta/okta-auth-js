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
  const { name, type, authenticators } = nextStep;
  if (name === 'select-authenticator-authenticate') {
    req.session.authenticators = authenticators;
    redirect({ req, res, path: '/login/with-authenticators/select-authenticator' });
    return true;
  } else if (name === 'challenge-authenticator') {
    redirect({ req, res, path: `/login/with-authenticators/challenge-authenticator/${type}` });
    return true;
  }
  return false;
};

const renderIdentify = (req, res) => {
  const { authenticator } = req.query;
  renderTemplate(req, res, 'identify', { 
    action: authenticator 
      ? `/login/with-authenticators?authenticator=${authenticator}` 
      : `/login/with-authenticators`
  });
};

router.get('/with-authenticators', renderIdentify);

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
    req.setLastError(error);
    renderIdentify(req, res);
  }
});

// Handle select-authenticator
const renderSelectAuthenticator = (req, res) => {
  const { authenticators } = req.session;
  renderTemplate(req, res, 'select-authenticator', {
    authenticators,
    action: '/login/with-authenticators/select-authenticator',
  });
};

router.get('/with-authenticators/select-authenticator', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderSelectAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/login/with-authenticators' });
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
    req.setLastError(error);
    renderSelectAuthenticator(req, res);
  }
});

// Handle email authenticator
const renderChallengeEmailAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: 'Challenge email authenticator',
    input: {
      type: 'text',
      name: 'verificationCode',
    },
    action: '/login/with-authenticators/challenge-authenticator/email',
  });
};

router.get(`/with-authenticators/challenge-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderChallengeEmailAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/login/with-authenticators' });
  }
});

router.post(`/with-authenticators/challenge-authenticator/email`, async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ verificationCode });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderChallengeEmailAuthenticator(req, res);
  }
});  

// Handle password authenticator
const renderChallengePasswordAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: 'Challenge password authenticator',
    input: {
      type: 'password',
      name: 'password',
    },
    action: '/login/with-authenticators/challenge-authenticator/password',
  });
};

router.get(`/with-authenticators/challenge-authenticator/password`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderChallengePasswordAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/login/with-authenticators' });
  }
});

router.post(`/with-authenticators/challenge-authenticator/password`, async (req, res) => {
  const { password } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ password });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderChallengePasswordAuthenticator(req, res);
  }
});

module.exports = router;
