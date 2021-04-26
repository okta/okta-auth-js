const express = require('express');
const { getAuthClient } = require('../utils');

const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    const authClient = getAuthClient(req);
    // Get okta signout redirect url
    // Call this method before revoke tokens as revocation clears tokens in storage
    const signoutRedirectUrl = authClient.getSignOutRedirectUrl({});
    // Revoke tokens
    await authClient.revokeRefreshToken();
    await authClient.revokeAccessToken();
    // Clear local session
    req.session.destroy();
    // Clear okta session with logout redirect
    res.redirect(signoutRedirectUrl);
  } catch (err) {
    console.log('/logout error: ', err);
  }
});

module.exports = router;

