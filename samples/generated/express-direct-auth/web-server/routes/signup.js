const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  redirect,
  renderTemplate,
  renderPage,
} = require('../utils');

const router = express.Router();

const BASE_PATH = '/signup';
const SUPPORTED_AUTHENTICATORS = ['email', 'password', 'phone'];

const proceed = ({ nextStep, req, res }) => {
  const { name, type, authenticators, canSkip } = nextStep;
  // Always reset canSkip to false before redirect
  req.session.canSkip = false;

  switch (name) {
    case 'enroll-profile':
      redirect({ req, res, path: `${BASE_PATH}` });
      return true;
    case 'select-authenticator-enroll':
      req.session.canSkip = canSkip;
      req.session.authenticators = authenticators;
      redirect({ req, res, path: `${BASE_PATH}/select-authenticator` });
      return true;
    case 'enroll-authenticator':
      if (!SUPPORTED_AUTHENTICATORS.includes(type)) {
        return false;
      }
      redirect({ req, res, path: `${BASE_PATH}/enroll-authenticator/${type}` });
      return true;
    case 'authenticator-enrollment-data':
      if (!SUPPORTED_AUTHENTICATORS.includes(type)) {
        return false;
      }
      redirect({ req, res, path: `${BASE_PATH}/enroll-authenticator/${type}/enrollment-data` });
      return true;
    default:
      return false;
  }
};

// entry route
router.get('/signup', (req, res) => {
  renderTemplate(req, res, 'enroll-profile', {
    action: '/signup'
  });
});

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({ 
    firstName, 
    lastName, 
    email,
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle select-authenticator
router.get('/signup/select-authenticator', (req, res) => {
  const { authenticators, canSkip } = req.session;
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/signup/select-authenticator',
      canSkip,
      skipAction: '/signup/select-authenticator/skip',
    })
  });
});

router.post('/signup/select-authenticator', async (req, res, next) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({
    authenticators: [authenticator],
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

router.post('/signup/select-authenticator/skip', async (req, res, next) => {
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({ skip: true });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle enroll authenticator -- email
router.get(`/signup/enroll-authenticator/email`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Enroll email authenticator',
      action: '/signup/enroll-authenticator/email',
      input: {
        type: 'text',
        name: 'verificationCode',
      }
    })
  });
});

router.post('/signup/enroll-authenticator/email', async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle enroll authenticator -- password
router.get(`/signup/enroll-authenticator/password`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action: '/signup/enroll-authenticator/password',
    })
  });
});

router.post('/signup/enroll-authenticator/password', async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const authClient = getAuthClient(req);
  if (password !== confirmPassword) {
    // TODO: handle validation in middleware
    next(new Error('Password not match'));
    return;
  }

  const authTransaction = await authClient.idx.register({ 
    password,
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

// Handle enroll authenticator - phone (sms)
router.get('/signup/enroll-authenticator/phone/enrollment-data', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'phone-enrollment-data', {
      action: '/signup/enroll-authenticator/phone/enrollment-data'
    })
  });
});

router.post('/signup/enroll-authenticator/phone/enrollment-data', async (req, res, next) => {
  const { phoneNumber } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({ 
    authenticators: ['phone'],
    phoneNumber,
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

router.get('/signup/enroll-authenticator/phone', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Enroll phone authenticator',
      action: '/signup/enroll-authenticator/phone',
      input: {
        type: 'text',
        name: 'verificationCode',
      }
    })
  });
});

router.post('/signup/enroll-authenticator/phone', async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const authTransaction = await authClient.idx.register({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, authTransaction, proceed });
});

module.exports = router;
