const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  renderTemplate,
} = require('../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  renderTemplate(req, res, 'social-idp', nextStep);
  return true;
};

router.get('/social-idp', async (req, res, next) => {
  const authClient = getAuthClient(req);
  const { availableSteps } = await authClient.idx.startTransaction();
  const idps = availableSteps 
    ? availableSteps
      .filter(({ name }) => name === 'redirect-idp')
      .map(({ href, idp: { name } }) => ({ name, href })) 
    : [];
  renderTemplate(req, res, 'social-idp', { idps });
  
  try {
    const transaction = await authClient.idx.authenticate({ state: req.transactionId });
    handleTransaction({ req, res, next, authClient, transaction, proceed });
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error);
    renderTemplate(req, res, 'social-idp');
  }
});

module.exports = router;
