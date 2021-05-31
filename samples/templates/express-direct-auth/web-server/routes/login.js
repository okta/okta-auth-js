const express = require('express');
const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
} = require('../utils');

const router = express.Router();

const getIdpSemanticClass = (type) => {
  switch (type) {
    case 'GOOGLE':
      return 'google plus';
    default: 
    return '';
  }
};

// entry route
router.get('/login', async (req, res) => {
  req.session.idxMethod = 'authenticate';

  // Delete the idp related render logic if you only want the username and password form
  const authClient = getAuthClient(req);
  const { availableSteps } = await authClient.idx.startTransaction({ state: req.transactionId });
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name }, type }) => ({ name, href, class: getIdpSemanticClass(type) })) 
    : [];

  const { authenticator } = req.query;
  renderTemplate(req, res, 'login', { 
    action: authenticator 
      ? `/login?authenticator=${authenticator}` 
      : `/login`,
    hasIdps: !!idps.length,
    idps,
  });
});

router.post('/login', async (req, res, next) => {
  const { authenticator } = req.query;
  const { username, password } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.authenticate({ 
    username,
    password,
    authenticators: authenticator ? [authenticator] : [],
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
      const error = new Error(
        'Multifactor Authentication and Social Identity Providers is not currently supported, Authentication failed.'
      );
      next(error);
      return;
    }

    next(err);
  }
});

module.exports = router;
