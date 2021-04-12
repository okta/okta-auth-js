const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    // Revoke tokens
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

    // Clear local session
    req.session.destroy();

    // Clear okta session with logout redirect
    const signoutRedirectUrl = await authClient.getSignOutRedirectUrl({ idToken });
    res.redirect(signoutRedirectUrl);
  } catch (err) {
    console.log('/logout error: ', err);
  }
});

module.exports = router;
