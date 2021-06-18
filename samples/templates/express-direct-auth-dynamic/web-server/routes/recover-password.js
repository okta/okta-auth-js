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
  renderEntryPage
} = require('../utils');

const router = express.Router();

const BASE_PATH = '/recover-password';
const SUPPORTED_AUTHENTICATORS = ['email', 'phone'];


const proceed = ({ req, res, nextStep }) => {
  const { name, type, authenticators } = nextStep;

  switch (name) {
    case 'select-authenticator-authenticate':
      req.session.authenticators = authenticators;
      redirect({ req, res, path: `${BASE_PATH}/select-authenticator` });
      return true;
    case 'challenge-authenticator':
    case 'authenticator-verification-data':
      if (!SUPPORTED_AUTHENTICATORS.includes(type)) {
        return false;
      }
      redirect({ req, res, path: `${BASE_PATH}/challenge-authenticator/${type}` });
      return true;
    case 'reset-authenticator':
      redirect({ req, res, path: `${BASE_PATH}/reset` });
      return true;
    default:
      return false;
  }
};

router.get('/recover-password', renderEntryPage);

router.post('/recover-password', async (req, res, next) => {
  const { authenticator } = req.query;
  const { identifier } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({
    identifier,
    authenticators: authenticator ? [authenticator] : [],
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle reset password
router.get('/recover-password/reset', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      action: '/recover-password/reset'
    })
  });
});

router.post('/recover-password/reset', async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    // TODO: handle error in validation middleware
    next(new Error('Password not match'));
    return;
  }

  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ password });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle select-authenticator
router.get('/recover-password/select-authenticator', (req, res) => {
  const { authenticators } = req.session;
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/recover-password/select-authenticator',
    })
  });
});

router.post('/recover-password/select-authenticator', async (req, res, next) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({
    authenticators: [authenticator],
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle email authenticator
router.get(`/recover-password/challenge-authenticator/email`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: `Challenge email authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/recover-password/challenge-authenticator/email',
    })
  });
});

router.post(`/recover-password/challenge-authenticator/email`, async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle phone (sms) authenticator
router.get(`/recover-password/challenge-authenticator/phone`, (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: `Challenge phone authenticator`,
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/recover-password/challenge-authenticator/phone',
    })
  });
});

router.post(`/recover-password/challenge-authenticator/phone`, async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

module.exports = router;
