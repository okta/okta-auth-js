const express = require('express');
{{#if dynamic}}
const { IdxFeature } = require('@okta/okta-auth-js');
{{/if}}
const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
  getIdpSemanticClass,
} = require('../utils');

const router = express.Router();

{{#if dynamic}}
const renderDynamicLoginPage = async (req, res) => {
  const authClient = getAuthClient(req);
  const { availableSteps, enabledFeatures } = await authClient.idx.startTransaction({ state: req.transactionId });

  // Prepare params for page render
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name }, type }) => ({ name, href, class: getIdpSemanticClass(type) })) 
    : [];
  const showLoginForm = availableSteps.some(({ name }) => name === 'identify');
  
  renderTemplate(req, res, 'dynamic-login', { 
    action: '/login',
    showLoginForm,
    canRegister: enabledFeatures.includes(IdxFeature.REGISTRATION),
    canRecoverPassword: enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY),
    hasIdps: !!idps.length,
    idps,
  });
};
{{else}}
const renderStaticLoginPage = async (req, res) => {
  // Delete the idp related render logic if you only want the username and password form
  const authClient = getAuthClient(req);
  const { availableSteps } = await authClient.idx.startTransaction({ state: req.transactionId });
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name }, type }) => ({ name, href, class: getIdpSemanticClass(type) })) 
    : [];

  renderTemplate(req, res, 'login', { 
    action: '/login',
    hasIdps: !!idps.length,
    idps,
  });
};
{{/if}}

// entry route
router.get('/login', (req, res) => {
  req.session.idxMethod = 'authenticate';

  {{#if dynamic}}
  renderDynamicLoginPage(req, res);
  {{else}}
  renderStaticLoginPage(req, res);
  {{/if}}
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ 
    username,
    password,
  });
  handleTransaction({ req, res, next, authClient, transaction });
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
      {{#if dynamic}}
      const transaction = await authClient.idx.authenticate({ state: req.transactionId });
      handleTransaction({ req, res, next, authClient, transaction });
      {{else}}
      next(new Error(
        'Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed.'
      ));
      {{/if}}
      return;
    }

    next(err);
  }
});

module.exports = router;
