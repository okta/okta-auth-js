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
  getTransactionMeta
} = require('../utils');

const router = express.Router();

router.get('/recover-password', async (req, res, next) => {
  const authClient = getAuthClient(req);
  try {
    const { query } = req;
    const recoveryToken = query['recoveryToken'] || query['token'];
    // https://github.com/okta/okta-signin-widget/blob/master/docs/interaction_code_flow.md#flow
    const flow = 'resetPassword';
    const state = req.transactionId;
    const meta = await getTransactionMeta(req, {
      flow,
      recoveryToken
    });

    const {
      clientId,
      redirectUri,
      issuer,
      scopes,
      codeChallenge, 
      codeChallengeMethod, 
    } = meta;

    const widgetConfig = {
      useInteractionCodeFlow: true,
      flow,
      issuer,
      clientId,
      redirectUri,
      state,
      scopes,
      codeChallenge,
      codeChallengeMethod,
      recoveryToken
    };
    res.render('login', {
      siwVersion: '6.1.0',
      widgetConfig: JSON.stringify(widgetConfig),
      selfHosted: !!process.env.SELF_HOSTED_WIDGET
    });
  } catch(error) {
    // Clear transaction
    authClient.transactionManager.clear();

    // Delegate error to global error handler
    next(error);
  }
});

module.exports = router;
