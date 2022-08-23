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
router.get('/unlock-account', (req, res) => {
  req.setFlowStates({
    entry: '/unlock-account'
  });

  renderTemplate(req, res, 'unlock-account', {
    action: '/unlock-account'
  });
});

router.post('/unlock-account', async (req, res, next) => {
  const authClient = getAuthClient(req);
  try {
    const transaction = await authClient.idx.unlockAccount({});
    handleTransaction({ req, res, next, authClient, transaction });
  }
  catch (err) {
    next(err);
  }
});

// Handle reset password
router.get('/select-authenticator-unlock-account', (req, res) => {
  const { 
    idx: { nextStep: { inputs } }
  } = req.getFlowStates();
  const { options } = inputs.find(({ name }) => name === 'authenticator');

  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'select-authenticator-unlock-account', {
      inputs,
      options,
      title: 'Select username and authenticator',
      action: '/select-authenticator-unlock-account'
    })
  });
});

router.post('/select-authenticator-unlock-account', async (req, res, next) => {
  const { username, authenticator } = req.body;
  const authClient = getAuthClient(req);
  try {
    const transaction = await authClient.idx.unlockAccount({ username, authenticator });
    handleTransaction({ req, res, next, authClient, transaction });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
