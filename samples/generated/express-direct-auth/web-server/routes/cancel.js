const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/cancel', async (req, res) => {
  // Cancel in progress flow with interactionHandle
  const { interactionHandle } = req.session;
  const authClient = getAuthClient(req);
  await authClient.idx.cancel({ interactionHandle });
    
  // Redirect back to home page
  res.redirect('/');
});

module.exports = router;
