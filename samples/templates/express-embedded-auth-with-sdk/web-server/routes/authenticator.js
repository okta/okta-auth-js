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

// Handle select-authenticator
router.get('/select-authenticator', (req, res) => {
  const { 
    idx: { nextStep: { options, canSkip } }
  } = req.getFlowStates();
  renderPage({ 
    req, res,
    render: () => renderTemplate(req, res, 'select-authenticator', {
      options,
      action: '/select-authenticator',
      canSkip,
      skipAction: '/select-authenticator/skip'
    })
  });
});

router.post('/select-authenticator', async (req, res, next) => {
  const { idxMethod } = req.getFlowStates();
  const { authenticator } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ authenticator });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.post('/select-authenticator/skip', async (req, res, next) => {
  const { idxMethod } = req.getFlowStates();
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ skip: true });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle challenge email authenticator
router.get('/challenge-authenticator/email', (req, res) => {
  renderPage({
    req, res,
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
  const { idxMethod } = req.getFlowStates();
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction });
});  

// Handle enroll authenticator -- email
router.get('/enroll-authenticator/email', (req, res) => {
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'authenticator', {
      req, res,
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
  const { idxMethod } = req.getFlowStates();
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle enroll authenticator -- password
router.get('/enroll-authenticator/password', (req, res) => {
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Set up password',
      action: '/enroll-authenticator/password',
    })
  });
});

router.post('/enroll-authenticator/password', async (req, res, next) => {
  const { idxMethod } = req.getFlowStates();
  const { password, confirmPassword } = req.body;
  const authClient = getAuthClient(req);
  if (password !== confirmPassword) {
    // TODO: handle validation in middleware
    next(new Error('Password not match'));
    return;
  }

  const transaction = await authClient.idx[idxMethod]({ password });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle phone authenticator
router.get('/verify-authenticator/phone', (req, res) => {
  const { 
    idx: { nextStep: { options } } 
  } = req.getFlowStates();
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'verify-phone', {
      title: 'Verify using phone authenticator',
      action: '/verify-authenticator/phone',
      options,
    })
  });
});

router.post('/verify-authenticator/phone', async (req, res, next) => {
  const { idxMethod } = req.getFlowStates();
  const { methodType } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ methodType });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.get('/challenge-authenticator/phone', (req, res) => {
  renderPage({
    req, res,
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
  const { idxMethod } = req.getFlowStates();
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ verificationCode });
  handleTransaction({ req, res, next, authClient, transaction });
});


router.get('/enroll-authenticator/phone/enrollment-data', (req, res) => {
  const { 
    idx: { nextStep: { options } } 
  } = req.getFlowStates();
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'phone-enrollment-data', {
      action: '/enroll-authenticator/phone/enrollment-data',
      options,
    })
  });
});

router.post('/enroll-authenticator/phone/enrollment-data', async (req, res, next) => {
  const { idxMethod } = req.getFlowStates();
  const { phoneNumber, methodType } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ 
    methodType,
    phoneNumber,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

router.get('/enroll-authenticator/phone', (req, res) => {
  renderPage({
    req, res,
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
  const { idxMethod } = req.getFlowStates();
  const { verificationCode } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx[idxMethod]({ 
    verificationCode,
  });
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
