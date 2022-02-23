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
const URL = require('url').URL;
const { 
  getAuthClient,
  getTransactionMeta
} = require('../utils');

const router = express.Router();

router.get('/login', async (req, res, next) => {
  const authClient = getAuthClient(req);
  try {
    const meta = await getTransactionMeta(req);
    const {
      clientId,
      redirectUri,
      issuer,
      scopes,
      state,
      codeChallenge, 
      codeChallengeMethod,
    } = meta;
    const { otp } = req.query;
    const widgetConfig = {
      useInteractionCodeFlow: true,
      issuer,
      clientId,
      redirectUri,
      state,
      scopes,
      codeChallenge,
      codeChallengeMethod,
      otp
    };
    res.render('login', {
      siwVersion: process.env.SIW_VERSION,
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

router.get('/login/callback', async (req, res, next) => {
  const parsedUrl = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const { search, href } = parsedUrl;
  const { state, otp } = req.query;
  const authClient = getAuthClient(req);

  if (authClient.idx.isEmailVerifyCallback(search)) {
    if (authClient.idx.canProceed({ state })) {
      res.redirect(`/login?state=${state}&otp=${otp}`);
      return;
    } else {
      const error = new Error(`Enter the OTP code in the original tab: ${otp}`);
      next(error);
      return;
    }
  }

  if (authClient.idx.isInteractionRequired(search)) {
    res.redirect(`/login?state=${state}`);
    return;
  }

  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(href);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
