/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  redirect,
  renderTemplate,
  renderPage,
  renderEntryPage,
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
router.get('/signup', renderEntryPage);

router.post('/signup', async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.register({ 
    firstName, 
    lastName, 
    email,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
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
  const transaction = await authClient.idx.register({
    authenticators: [authenticator],
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

router.post('/signup/select-authenticator/skip', async (req, res, next) => {
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.register({ skip: true });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
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
  const transaction = await authClient.idx.register({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
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

  const transaction = await authClient.idx.register({ 
    password,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
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
  const transaction = await authClient.idx.register({ 
    authenticators: ['phone'],
    phoneNumber,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
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
  const transaction = await authClient.idx.register({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

module.exports = router;
