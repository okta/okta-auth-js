const express = require('express');
const { 
  getAuthTransaction,
  renderTemplate,
} = require('../../utils');

const sampleConfig = require('../../../config').webServer;

const router = express.Router();

router.get('/with-widget', (req, res) => {
  getAuthTransaction(req)
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
      const widgetConfig = {
        baseUrl: sampleConfig.oidc.issuer.split('/oauth2')[0],
        clientId: sampleConfig.oidc.clientId,
        redirectUri: sampleConfig.oidc.redirectUri,
        authParams: {
          issuer: sampleConfig.oidc.issuer,
          scopes: sampleConfig.oidc.scopes,
        },
        useInteractionCodeFlow: true,
        state,
        interactionHandle,
        codeChallenge,
        codeChallengeMethod,
      };
      renderTemplate(req, res, 'login-with-widget', {
        siwVersion: '{{siwVersion}}',
        widgetConfig: JSON.stringify(widgetConfig),
      });
    })
    .catch(error => {
      req.setLastError(error);
      renderTemplate(req, res, 'terminal-error');
    });
});

module.exports = router;
