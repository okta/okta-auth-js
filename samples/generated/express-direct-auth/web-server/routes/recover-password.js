const express = require('express');

const router = express.Router();

router.get('/recover-password', (req, res) => {
  res.render('recover-password');
});

module.exports = router;
