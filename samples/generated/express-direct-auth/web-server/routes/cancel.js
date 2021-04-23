const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/cancel', async (req, res) => {
  const authClient = getAuthClient(req);
  await authClient.idx.cancel();
    
  // Redirect back to home page
  res.redirect('/');
});

module.exports = router;
