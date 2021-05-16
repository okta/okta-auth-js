const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  renderTemplate,
} = require('../../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  renderTemplate(req, res, 'login-with-idp', nextStep);
  return true;
};

router.get('/with-idp', async (req, res, next) => {
  const authClient = getAuthClient(req);
  try {
    const transaction = await authClient.idx.authenticate({ state: req.transactionId });
    handleTransaction({ req, res, next, authClient, transaction, proceed });
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error);
    renderTemplate(req, res, 'login-with-idp');
  }
});

module.exports = router;
