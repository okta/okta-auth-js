const express = require('express');
const { renderTemplate } = require('../utils');

const router = express.Router();

router.get('/terminal', (req, res) => {
  const messages = req.getTerminalMessages();
  req.clearTerminalMessages();

  if (!messages || !messages.length) {
    res.redirect('/');
  } else {
    renderTemplate(req, res, 'terminal', {
      messages
    });
  }
});

module.exports = router;
