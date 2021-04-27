const express = require('express');
const primary = require('./primary');
const withWidget = require('./with-widget');
const withIdp = require('./with-idp');
const withAuthenticators = require('./with-authenticators');
const { 
  getAuthClient,
} = require('../../utils');

const router = express.Router();

router.use('/login', [
  primary,
  withWidget,
  withIdp,
  withAuthenticators,
]);

router.get('/login/callback', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    if (authClient.isInteractionRequiredError(err) !== true) {
      console.log('Failed to handle interaction code callback, error: ', err);
      req.setLastError(err);
    }

    // TODO: show error message in home page
    res.redirect('/');
  }
});


module.exports = router;
