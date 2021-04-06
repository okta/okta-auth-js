const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const { getAuthClient } = require('../utils');

const router = express.Router();

passport.use(new Strategy(
  async function(username, password, cb) {
    const authClient = getAuthClient();
    try {
      const { data: 
        { tokens: { tokens } } 
      } = await authClient.idx.authenticate({ username, password });
      const { accessToken, idToken } = tokens;
      const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
      // Clear transaction meta after authentication
      authClient.transactionManager.clear();
      cb(null, { userinfo, tokens });
    } catch (err) {
      console.log('err', err);
      cb(err, null);
    }
  }));

passport.serializeUser(function(userContext, cb) {
  cb(null, userContext);
});

passport.deserializeUser(function(userContext, cb) {
  cb(null, userContext);
});

router.get('/login', (_, res) => {
  res.render('login');
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }), 
  (_, res) => {
    res.redirect('/');
  });

module.exports = router;
