const express = require('express');
const { IdxStatus } = require('@okta/okta-auth-js');
const { 
  getAuthClient, 
  renderError, 
  handleAuthTransaction,
  getAuthTransaction,
  renderTemplate
} = require('../utils');
const { 
  generateSelectAuthenticator, 
  generateChallengeAuthenticator,
} = require('../routeUtils');
const sampleConfig = require('../../config').webServer;

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  const { name, type, authenticators } = nextStep;
  if (name === 'select-authenticator-authenticate') {
    req.session.authenticators = authenticators;
    res.redirect('/login/select-authenticator');
    return true;
  } else if (name === 'challenge-authenticator') {
    res.redirect(`/login/challenge-${type}-authenticator`);
    return true;
  } else if (name === 'reenroll-authenticator') {
    res.redirect('/login/change-password');
    return true;
  }
  return false;
};

const renderLogin = (req, res) => {
  res.render('login');
};

const renderLoginWithWidget = (req, res) => {
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
};

const renderLoginWithIDP = (req, res) => {
  const authClient = getAuthClient(req);
  try {
    const { 
      data: { 
        tokens, 
        error,
      },
    } = await authClient.idx.authenticate(); // Policy must be configured to return a `redirect-idp` remediation
    if (error) {
      throw error;
    }
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error.message);
    res.redirect('/login');
  }

};

router.get('/login', (req, res) => {
  const { widget, idp } = req.query;
  if (widget) {
    renderLoginWithWidget(req, res);
  } else if (idp) {
    renderLoginWithIDP(req, res);
  } else {
    renderTemplate(req, res, 'login');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ 
      username, 
      password,
      authenticators: ['email'],
    });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error.message);
    res.redirect('/login');
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
    if (authClient.isInteractionRequiredError(err) !== true) {
      console.log('Failed to handle interaction code callback, error: ', err);
      req.setLastError(err);
    }

    res.redirect('/login?widget=1');
  }
});

generateSelectAuthenticator({ flow: 'login', next, router });
generateChallengeAuthenticator({ flow: 'login', type: 'email', next, router });

module.exports = router;
