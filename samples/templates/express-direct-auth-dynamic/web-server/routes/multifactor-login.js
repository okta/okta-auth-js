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
  redirect,
  renderEntryPage,
} = require('../utils');

const router = express.Router();

const BASE_PATH = '/multifactor-login';
const SUPPORTED_AUTHENTICATORS = ['email', 'password'];

const proceed = ({ nextStep, req, res }) => {
  const { name, type, authenticators } = nextStep;

  switch (name) {
    case 'identify':
      redirect({ req, res, path: BASE_PATH });
      return true;
    case 'select-authenticator-authenticate':
      req.session.authenticators = authenticators;
      redirect({ 
        req, res, path: `${BASE_PATH}/select-authenticator` 
      });
      return true;
    case 'challenge-authenticator':
      if (!SUPPORTED_AUTHENTICATORS.includes(type)) {
        return false;
      }    
      redirect({ 
        req, res, path: `${BASE_PATH}/challenge-authenticator/${type}` 
      });
      return true;
    default:
      return false;
  }
};

// entry route
router.get('/multifactor-login', renderEntryPage);

router.post('/multifactor-login', async (req, res, next) => {
  const { authenticator } = req.query;
  const { username } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ 
    username,
    authenticators: authenticator ? [authenticator] : [],
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle select-authenticator
router.get('/multifactor-login/select-authenticator', (req, res) => {
  const { authenticators } = req.session;
  renderPage({ 
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      authenticators,
      action: '/multifactor-login/select-authenticator',
    })
  });
});

router.post('/multifactor-login/select-authenticator', async (req, res, next) => {
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({
    authenticators: [authenticator],
  });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

// Handle email authenticator
router.get('/multifactor-login/challenge-authenticator/email', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Challenge email authenticator',
      input: {
        type: 'text',
        name: 'verificationCode',
      },
      action: '/multifactor-login/challenge-authenticator/email',
    })
  });
});

router.post('/multifactor-login/challenge-authenticator/email', async (req, res, next) => {
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});  

// Handle password authenticator
router.get('/multifactor-login/challenge-authenticator/password', (req, res) => {
  renderPage({
    req, res, basePath: BASE_PATH,
    render: () => renderTemplate(req, res, 'authenticator', {
      title: 'Challenge password authenticator',
      input: {
        type: 'password',
        name: 'password',
      },
      action: '/multifactor-login/challenge-authenticator/password',
    })
  });
});

router.post('/multifactor-login/challenge-authenticator/password', async (req, res, next) => {
  const { password } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ password });
  handleTransaction({ req, res, next, authClient, transaction, proceed });
});

module.exports = router;
