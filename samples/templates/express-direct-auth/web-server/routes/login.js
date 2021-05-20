const express = require('express');
const { 
  getAuthClient, 
  handleTransaction,
  renderTemplate,
} = require('../utils');

const router = express.Router();

// entry route
router.get('/login', async (req, res) => {
  req.session.idxMethod = 'authenticate';

  // Delete the idp related render logic if you only want the username and password form
  const authClient = getAuthClient(req);
  const { availableSteps } = await authClient.idx.startTransaction();
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name } }) => ({ name, href })) 
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

module.exports = router;
