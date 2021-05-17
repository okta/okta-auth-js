const { getAuthClient } = require('../utils');

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  // Clear transaction if return to home page in the middle of a transaction
  const authClient = getAuthClient(req);
  authClient.transactionManager.clear();

  const userinfo = req.userContext && req.userContext.userinfo;
  res.render('home', {
    isLoggedIn: !!userinfo,
    userinfo,
  });
});

module.exports = router;
