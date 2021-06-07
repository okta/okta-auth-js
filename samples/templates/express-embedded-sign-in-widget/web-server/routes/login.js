const express = require('express');
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

      if (!interactionHandle) {
        throw new Error(
          'Missing required configuration "interactionHandle" to initialize the widget'
        );
      }

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
        interactionHandle,
        codeChallenge,
        codeChallengeMethod,
      };
      res.render('login', {
        siwVersion: '{{siwVersion}}',
        widgetConfig: JSON.stringify(widgetConfig),
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
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    if (authClient.isInteractionRequiredError(err) === true) {
      const { state } = req.query;
      res.redirect('/login?state=' + state);
      return;
    }

    next(err);
  }
});

module.exports = router;
