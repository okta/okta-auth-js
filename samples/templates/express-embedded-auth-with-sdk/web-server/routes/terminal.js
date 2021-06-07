const express = require('express');
const { renderTemplate } = require('../utils');

const router = express.Router();

router.get('/terminal', (req, res) => {
  renderTemplate(req, res, 'terminal');
});

module.exports = router;
