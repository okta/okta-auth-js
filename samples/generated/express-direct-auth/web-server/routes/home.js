const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const userinfo = req.userContext && req.userContext.userinfo;
  const attributes = userinfo ? Object.entries(userinfo) : [];

  const hasAppSession = Object.keys(req.session).filter(k => (k != 'cookie')).length > 0;
  res.cookie('has-app-session', hasAppSession);
  
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo,
    attributes
  });
});

module.exports = router;
