const express = require('express');
const { 
  getAuthTransaction,
  renderTemplate,
} = require('../../utils');

const getConfig = require('../../../config');

const router = express.Router();

router.get('/with-widget', (req, res) => {
  getAuthTransaction(req, res)
    .then(authTransaction => {
      const {
        interactionHandle,
        codeChallenge, 
        codeChallengeMethod, 
        state,
      } = authTransaction.data;

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
      renderTemplate(req, res, 'login-with-widget', {
        siwVersion: '5.5.4',
        widgetConfig: JSON.stringify(widgetConfig),
      });
    })
    .catch(error => {
      req.setLastError(error);
      renderTemplate(req, res, 'terminal');
    });
});

module.exports = router;
