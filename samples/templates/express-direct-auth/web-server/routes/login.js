const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.get('/login', (_, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get tokens and userInfo
    const authClient = getAuthClient(req);
    const { data: 
      { tokens: { tokens } } 
    } = await authClient.idx.authenticate({ username, password });
    // Save tokens to storage (req.session)
    authClient.tokenManager.setTokens(tokens);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    console.log('/login error: ', err);

    const errors = err.errorCauses ? err.errorCauses : ['Authentication failed'];
    res.render('login', { 
      hasError: errors && errors.length,
      errors 
    });
  }
});


module.exports = router;
