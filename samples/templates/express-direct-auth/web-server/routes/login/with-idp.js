const express = require('express');
const { 
  getAuthClient,
  handleAuthTransaction,
  renderTemplate,
} = require('../../utils');

const router = express.Router();

const next = ({ nextStep, req, res }) => {
  renderTemplate(req, res, 'login-with-idp', nextStep);
  return true;
};

router.get('/with-idp', async (req, res) => {
  const authClient = getAuthClient(req);
  try {
    const authTransaction = await authClient.idx.authenticate({ state: req.transactionId });
    handleAuthTransaction({ req, res, next, authClient, authTransaction });
  } catch (error) {
    authClient.transactionManager.clear();
    req.setLastError(error);
    renderTemplate(req, res, 'login-with-idp');
  }
});

module.exports = router;
