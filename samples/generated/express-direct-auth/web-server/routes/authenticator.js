const express = require('express');

const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
  renderPage,
} = require('../utils');

const router = express.Router();

const BASE_PATH = '';

// Handle select-authenticator
router.get('/select-authenticator', (req, res) => {
  const { authenticators, canSkip } = req.session;
  renderPage({ 
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/select-authenticator',
      canSkip,
      skipAction: '/select-authenticator/skip'
    })
  });
});

router.post('/select-authenticator', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { authenticator } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({
    authenticators: [authenticator],
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.post('/select-authenticator/skip', async (req, res, next) => {
  const { idxMethod } = req.session;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ skip: true });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle challenge email authenticator
router.get('/challenge-authenticator/email', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Challenge email authenticator',
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/challenge-authenticator/email',
    })
  });
});

router.post('/challenge-authenticator/email', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction });
});  

// Handle enroll authenticator -- email
router.get('/enroll-authenticator/email', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Enroll email authenticator',
      action: '/enroll-authenticator/email',
      input: {
        type: 'text',
        name: 'verificationCode',
      }
    })
  });
});

router.post('/enroll-authenticator/email', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle enroll authenticator -- password
router.get('/enroll-authenticator/password', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action: '/enroll-authenticator/password',
    })
  });
});

router.post('/enroll-authenticator/password', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { password, confirmPassword } = req.body;
  const authClient = getAuthClient(req, res);
  if (password !== confirmPassword) {
    // TODO: handle validation in middleware
    next(new Error('Password not match'));
    return;
  }

  const transaction = await authClient.idx[idxMethod]({ 
    password,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle phone authenticator
router.get('/verify-authenticator/phone', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'verify-phone', {
      title: 'Verify using phone authenticator',
      action: '/verify-authenticator/phone',
    })
  });
});

router.post('/verify-authenticator/phone', async (req, res, next) => {
  const { idxMethod } = req.session;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ authenticators: ['phone'] });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.get('/challenge-authenticator/phone', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Challenge phone authenticator',
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/challenge-authenticator/phone',
    })
  });
});

router.post('/challenge-authenticator/phone', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction });
});


router.get('/enroll-authenticator/phone/enrollment-data', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'phone-enrollment-data', {
      action: '/enroll-authenticator/phone/enrollment-data'
    })
  });
});

router.post('/enroll-authenticator/phone/enrollment-data', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { phoneNumber } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ 
    authenticators: ['phone'],
    phoneNumber,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.get('/enroll-authenticator/phone', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Enroll phone authenticator',
      action: '/enroll-authenticator/phone',
      input: {
        type: 'text',
        name: 'verificationCode',
      }
    })
  });
});

router.post('/enroll-authenticator/phone', async (req, res, next) => {
  const { idxMethod } = req.session;
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req, res);
  const transaction = await authClient.idx[idxMethod]({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
