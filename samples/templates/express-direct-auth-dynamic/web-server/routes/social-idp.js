const express = require('express');
const {
  renderTemplate,
  renderEntryPage,
} = require('../utils');

const router = express.Router();

const proceed = ({ nextStep, req, res }) => {
  renderTemplate(req, res, 'login-with-idp', nextStep);
  return true;
};

router.get('/social-idp', renderEntryPage);

router.get('/login/callback', async (req, res) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  const authClient = getAuthClient(req);
  try {
    // Exchange code for tokens
    await authClient.idx.handleInteractionCodeRedirect(url);
    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    if (authClient.isInteractionRequiredError(err) === true) {
      const { state } = req.query;
      res.redirect('/login/with-widget?state=' + state);
      return;
    }

    // TODO: show error message in home page
    req.setLastError(err);
    res.redirect('/');
  }
});

module.exports = router;
