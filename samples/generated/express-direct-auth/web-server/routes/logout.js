const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    // Revoke tokens
    const authClient = getAuthClient();
    await authClient.revokeRefreshToken();
    await authClient.revokeAccessToken();

    // Clear local session
    req.session.destroy();

    // Clear okta session with logout redirect
    const signoutRedirectUrl = authClient.getSignOutRedirectUrl({ idToken });
    res.redirect(signoutRedirectUrl);
  } catch (err) {
    console.log('/logout error: ', err);
  }
});

module.exports = router;
