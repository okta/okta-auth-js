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
  getAuthTransaction,
  getAuthClient,
} = require('../utils');

const getConfig = require('../../config');

const router = express.Router();

router.get('/login', (req, res, next) => {
  getAuthTransaction(req)
    .then(({ meta }) => {
      const {
        interactionHandle,
        codeChallenge, 
        codeChallengeMethod, 
        state,
      } = meta;

      const { stateTokenExternalId } = req.query;
      console.log('renderLoginWithWidget: using interaction handle: ', interactionHandle);
      const { clientId, redirectUri, issuer, scopes } = getConfig().webServer.oidc;
      const widgetConfig = {
        baseUrl: issuer.split('/oauth2')[0],
        clientId: clientId,
        redirectUri: redirectUri,
        authParams: {
          issuer: issuer,
          scopes: scopes,
        },
        useInteractionCodeFlow: true,
        state,
        stateTokenExternalId,
        interactionHandle,
        codeChallenge,
        codeChallengeMethod,
      };
      res.render('login', {
        siwVersion: '5.16.0',
        widgetConfig: JSON.stringify(widgetConfig),
        selfHosted: !!process.env.SELF_HOSTED_WIDGET
      });
    })
    .catch((error) => {
      // Clear transaction
      const authClient = getAuthClient(req);
      authClient.transactionManager.clear();

      // Delegate error to global error handler
      next(error);
    });
});

router.get('/login/callback', async (req, res, next) => {
  const parsedUrl = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const { search, href } = parsedUrl;
  const { state, stateTokenExternalId } = req.query;
  const authClient = getAuthClient(req);

  if (authClient.isEmailVerifyCallback(search)) {
    res.redirect(`/login?state=${state}&stateTokenExternalId=${stateTokenExternalId}`);
    return;
  }

  if (authClient.isInteractionRequired(search)) {
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
