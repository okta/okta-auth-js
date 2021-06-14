const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  // clear any existing transaction
  req.clearFlowStates();

  // collect attrs for render
  const userinfo = req.userContext && req.userContext.userinfo;
  const attributes = userinfo ? Object.entries(userinfo) : [];
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo,
    attributes
  });
});

module.exports = router;
