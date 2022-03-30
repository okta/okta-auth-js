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
  renderTemplate,
  renderPage,
} = require('../utils');

const router = express.Router();

// entry route
router.get('/recover-password', async (req, res, next) => {
  const { transactionId } = req;
  req.setFlowStates({
    entry: '/recover-password'
  });
  const { query } = req;
  const recoveryToken = query['recoveryToken'] || query['token'];
  if (recoveryToken) {
    const authClient = getAuthClient(req);
    try {
      const transaction = await authClient.idx.recoverPassword({ recoveryToken });
      handleTransaction({ req, res, next, authClient, transaction });
    } catch (error) {
      next(error);
    }
    return;
  }

  renderTemplate(req, res, 'recover-password', {
    action: `/recover-password?state=${transactionId}`
  });
});

router.post('/recover-password', async (req, res, next) => {
  const { username } = req.body;
  const authClient = getAuthClient(req);
  try {
    const transaction = await authClient.idx.recoverPassword({ username });
    handleTransaction({ req, res, next, authClient, transaction });
  } catch (error) {
    next(error);
  }
});

// Handle reset password
router.get('/reset-password', (req, res) => {
  const { transactionId } = req;
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      action: `/reset-password?state=${transactionId}`
    })
  });
});

router.post('/reset-password', async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    // TODO: handle error in validation middleware
    next(new Error('Password not match'));
    return;
  }

  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ password });
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
