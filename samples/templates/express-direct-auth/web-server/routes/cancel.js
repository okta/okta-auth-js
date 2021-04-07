const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/cancel', async (req, res) => {
  // Cancel in progress flow with stateHandle
  const { stateHandle } = req.session;
  const authClient = getAuthClient();
  await authClient.idx.cancel({ stateHandle })
    
  // Redirect back to home page
  res.redirect('/');
});

module.exports = router;
