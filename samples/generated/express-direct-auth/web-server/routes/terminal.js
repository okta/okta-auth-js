const express = require('express');
const { renderTemplate, getAuthClient } = require('../utils');

const router = express.Router();

router.get('/terminal', (req, res) => {

  // Clear transaction meta at app layer when reach to terminal state
  const authClient = getAuthClient(req);
  authClient.transactionManager.clear();

  // If there are any error messages, these are handled within `renderTemplate`
  renderTemplate(req, res, 'terminal', {});
});

module.exports = router;
