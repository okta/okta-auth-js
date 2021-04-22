const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { getAuthClient, renderError, handleAuthTransaction } = require('../utils');
const sampleConfig = require('../../config').webServer;

const router = express.Router();

const next = (nextStep, res) => {
  const { name } = nextStep;
  if (name === 'reenroll-authenticator') {
    res.redirect('/login/change-password');
    return true;
  }
  return false;
}

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
          scopes: sampleConfig.oidc.scopes,
        },
        useInteractionCodeFlow: true,
        state,
        interactionHandle,
        codeChallenge,
        codeChallengeMethod,
      });
      res.render('login-with-widget', {
        siwVersion: '{{siwVersion}}',
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
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ username, password });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'login',
      error,
    });
  }
});

router.get('/login/change-password', (req, res) => {
  const { status } = req.session;
  if (status === IdxStatus.PENDING) {
    res.render('enroll-or-reset-password-authenticator', {
      title: 'Change password',
      action: '/login/change-password',
    });
  } else {
    res.redirect('/login');
  }
});

router.post('/login/change-password', async (req, res) => {
  const { password: newPassword } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ newPassword });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    renderError(res, {
      template: 'enroll-or-reset-password-authenticator',
      title: 'Change password',
      error,
    });
  }
});

router.get('/login/callback', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    console.log('Failed to handle interaction code callback, error: ', err);
    res.redirect('/login?widget=1');
  }
});


module.exports = router;
