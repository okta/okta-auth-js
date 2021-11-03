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


const { 
  getAuthClient,
  handleTransaction,
  renderTemplate,
  renderPage,
  routerWithCatch,
} = require('../utils');

const router = routerWithCatch();

// entry route
router.get('/recover-password', (req, res) => {
  req.setFlowStates({
    entry: '/recover-password',
    idxMethod: 'recoverPassword'
  });

  renderTemplate(req, res, 'recover-password', {
    action: '/recover-password'
  });
});

router.post('/recover-password', async (req, res, next) => {
  const { username } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ username });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle reset password
router.get('/reset-password', (req, res) => {
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      action: '/reset-password'
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
