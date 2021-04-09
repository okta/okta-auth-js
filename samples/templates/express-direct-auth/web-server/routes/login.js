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
    const authClient = getAuthClient();
    const { data: 
      { tokens: { tokens } } 
    } = await authClient.idx.authenticate({ username, password });
    const { accessToken, idToken } = tokens;
    const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
    // Persist userContext in session
    req.session.userContext = JSON.stringify({ userinfo, tokens });
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
