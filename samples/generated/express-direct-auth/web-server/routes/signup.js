const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient,
  handleAuthTransaction,
  redirect,
  renderTemplate,
} = require('../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name, type, authenticators, canSkip } = nextStep;
  // Always reset canSkip to false before redirect
  req.session.canSkip = false;
  if (name === 'select-authenticator-enroll') {
    req.session.canSkip = canSkip;
    req.session.authenticators = authenticators;
    redirect({ req, res, path: '/signup/select-authenticator' });
    return true;
  } else if (name === 'enroll-authenticator') {
    redirect({ req, res, path: `/signup/enroll-authenticator/${type}` });
    return true;
  } else if (name === 'authenticator-enrollment-data') {
    redirect({ req, res, path: `/signup/enroll-authenticator/${type}/enrollment-data` });
    return true;
  }
  return false;
};

const renderEnrollProfile = (req, res) => {
  renderTemplate(req, res, 'enroll-profile', {
    action: '/signup'
  });
};

router.get('/signup', renderEnrollProfile);

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      firstName, 
      lastName, 
      email,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderEnrollProfile(req, res);
  }
});

// Handle select-authenticator
const renderSelectAuthenticator = (req, res) => {
  const { authenticators, canSkip } = req.session;
  renderTemplate(req, res, 'select-authenticator', {
    authenticators,
    action: '/signup/select-authenticator',
    canSkip,
    skipAction: '/signup/select-authenticator/skip',
  });
};

router.get('/signup/select-authenticator', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderSelectAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/select-authenticator', async (req, res) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({
      authenticators: [authenticator],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderSelectAuthenticator(req, res);
  }
});

router.post('/signup/select-authenticator/skip', async (req, res) => {
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ skip: true });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderSelectAuthenticator(req, res);
  }
});

// Handle enroll authenticator -- email
const renderEnrollEmailAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: 'Enroll email authenticator',
    action: '/signup/enroll-authenticator/email',
    input: {
      type: 'text',
      name: 'verificationCode',
    }
  });
};

router.get(`/signup/enroll-authenticator/email`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderEnrollEmailAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/enroll-authenticator/email', async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      verificationCode,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderEnrollEmailAuthenticator(req, res);
  }
});

// Handle enroll authenticator -- password
const renderEnrollPasswordAuthenticator = (req, res) => {
  renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
    title: 'Set up password',
    action: '/signup/enroll-authenticator/password',
  });
};

router.get(`/signup/enroll-authenticator/password`, (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderEnrollPasswordAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/enroll-authenticator/password', async (req, res) => {
  const { password, confirmPassword } = req.body;
  const authClient = getAuthClient(req);
  try {
    if (password !== confirmPassword) {
      throw new Error('Password not match');
    }

    const authTransaction = await authClient.idx.register({ 
      password,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderEnrollPasswordAuthenticator(req, res);
  }
});

// Handle enroll authenticator - phone (sms)
const renderEnrollPhoneAuthenticatorEnrollmentData = (req, res) => {
  renderTemplate(req, res, 'phone-enrollment-data', {
    action: '/signup/enroll-authenticator/phone/enrollment-data'
  })
};

router.get('/signup/enroll-authenticator/phone/enrollment-data', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderEnrollPhoneAuthenticatorEnrollmentData(req, res);
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/enroll-authenticator/phone/enrollment-data', async (req, res) => {
  const { phoneNumber } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      authenticators: ['phone'],
      phoneNumber,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderEnrollPhoneAuthenticatorEnrollmentData(req, res);
  }
});

const renderEnrollPhoneAuthenticator = (req, res) => {
  renderTemplate(req, res, 'authenticator', {
    title: 'Enroll phone authenticator',
    action: '/signup/enroll-authenticator/phone',
    input: {
      type: 'text',
      name: 'verificationCode',
    }
  })
};

router.get('/signup/enroll-authenticator/phone', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    renderEnrollPhoneAuthenticator(req, res);
  } else {
    redirect({ req, res, path: '/signup' });
  }
});

router.post('/signup/enroll-authenticator/phone', async (req, res) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.register({ 
      verificationCode,
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    req.setLastError(error);
    renderEnrollPhoneAuthenticator(req, res);
  }
});

module.exports = router;
