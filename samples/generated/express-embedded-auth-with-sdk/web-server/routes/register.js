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
} = require('../utils');

const router = express.Router();

// entry route
router.get('/register', async (req, res, next) => {
  req.setFlowStates({
    entry: '/register'
  });
  const authClient = getAuthClient(req);

  const { query } = req;
  const activationToken = query['activationToken'] || query['token'];

  const transaction = await authClient.idx.register({ activationToken });
  if (transaction.error) {
    next(transaction.error);
    return;
  }

  const {
    nextStep
  } = transaction;

  const { inputs } = nextStep;

  if (activationToken) {
    handleTransaction({ req, res, next, authClient, transaction });
    return; 
  }

  renderTemplate(req, res, 'enroll-profile', {
    action: '/register',
    inputs
  });
});

router.post('/register', async (req, res, next) => {
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.register(req.body);
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
