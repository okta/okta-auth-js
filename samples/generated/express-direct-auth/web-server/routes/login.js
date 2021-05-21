const express = require('express');
const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
  getIdpSemanticClass,
} = require('../utils');

const router = express.Router();

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

// entry route
router.get('/login', (req, res) => {
  req.session.idxMethod = 'authenticate';

  renderStaticLoginPage(req, res);
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
      next(new Error(
        'Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed.'
      ));
      return;
    }

    next(err);
  }
});

module.exports = router;
