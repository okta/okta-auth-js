const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const userinfo = req.userContext && req.userContext.userinfo;
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo,
  });
});

module.exports = router;
