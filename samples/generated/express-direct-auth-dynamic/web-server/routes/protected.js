const express = require('express');
const { ensureAuthenticated } = require('../middlewares');

const router = express.Router();

router.get('/profile', 
  ensureAuthenticated,
  (req, res) => {
    // Convert the userinfo object into an attribute array, for rendering with mustache
    const userinfo = req.userContext && req.userContext.userinfo;
    const attributes = Object.entries(userinfo);
    res.render('profile', {
      isLoggedIn: !!userinfo,
      userinfo: userinfo,
      attributes
    });
  });

module.exports = router;
