const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    // revoke tokens
    const { 
      tokens : { idToken, accessToken, refreshToken } 
    } = req.userContext;
    const authClient = getAuthClient();
    if (refreshToken) {
      await authClient.revokeRefreshToken(refreshToken);
    }
    if (accessToken) {
      await authClient.revokeAccessToken(accessToken);
    }

    // clear local session
    req.logout();

    // logout redirect to clear okta session
    const signoutRedirectUrl = await authClient.getSignOutRedirectUrl({ idToken });
    res.redirect(signoutRedirectUrl);
  } catch (err) {
    console.log('logout error', err);
  }
});

module.exports = router;
