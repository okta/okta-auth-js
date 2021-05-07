const express = require('express');
const { renderTemplate, getAuthClient } = require('../utils');

const router = express.Router();

router.get('/terminal', (req, res) => {
  const messages = req.getTerminalMessages();
  req.clearTerminalMessages();

  // Clear transaction meta at app layer when reach to terminal state
  const authClient = getAuthClient(req);
  authClient.transactionManager.clear();

  // Render
  if (!messages || !messages.length) {
    res.redirect('/');
  } else {
    renderTemplate(req, res, 'terminal', {
      messages
    });
  }
});

module.exports = router;
