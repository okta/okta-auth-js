const express = require('express');
const { 
  getAuthClient,
  renderTemplate,
} = require('../../utils');

const router = express.Router();

router.get('/with-idp', async (req, res) => {
  const authClient = getAuthClient(req);
  try {
    const tx = await authClient.idx.authenticate({ state: req.transactionId });
    if (!tx.data.nextStep || tx.data.nextStep.name !== 'redirect-idp') {
      throw new Error('Okta Signon policy must be configured to use an Identity Provider');
    }
    renderTemplate(req, res, 'login-with-idp', tx.data.nextStep);
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error);
    renderTemplate(req, res, 'login-with-idp');
  }
});

module.exports = router;
