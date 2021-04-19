const express = require('express');
const { getAuthClient, renderError } = require('../utils');
const sampleConfig = require('../../config').webServer;

const router = express.Router();

const renderLogin = (req, res) => {
  res.render('login');
};

const renderLoginWithWidget = (req, res) => {
  const authClient = getAuthClient(req);
  authClient.idx.startAuthTransaction()
    .then(authTransaction => {
      const {
        data: {
          interactionHandle,
          meta: {
            codeChallenge, 
            codeChallengeMethod, 
            state,
          }
        }
      } = authTransaction;

      if (!interactionHandle) {
        throw new Error(
          'Missing required congifuration "interactionHandle" to initial the widget'
        );
      }

      const widgetConfig = JSON.stringify({
        baseUrl: sampleConfig.oidc.issuer.split('/oauth2')[0],
        clientId: sampleConfig.oidc.clientId,
        redirectUri: sampleConfig.oidc.redirectUri,
        authParams: {
          issuer: sampleConfig.oidc.issuer,
          scopes: sampleConfig.oidc.scope.split(' '),
        },
        useInteractionCodeFlow: true,
        state,
        interactionHandle,
        codeChallenge,
        codeChallengeMethod,
      });
      res.render('login-with-widget', {
        siwVersion: '5.5.2',
        widgetConfig,
      });
    })
    .catch(error => {
      renderError(res, {
        template: 'login-with-widget',
        error,
      });
    });
};

router.get('/login', (req, res) => {
  const { widget } = req.query;
  if (widget) {
    renderLoginWithWidget(req, res);
  } else {
    renderLogin(req, res); 
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Get tokens and userInfo
    const authClient = getAuthClient(req);
    const { 
      data: { tokens } 
    } = await authClient.idx.authenticate({ username, password });
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  } catch (error) {
    renderError(res, {
      template: 'login',
      error,
    });
  }
});

router.get('/login/callback', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  try {
    // Exchange code for tokens
    const authClient = getAuthClient(req);
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    console.log('Failed to handle interaction code callback, error: ', err);
    res.redirect('/login?widget=1');
  }
});


module.exports = router;
