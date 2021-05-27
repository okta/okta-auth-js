const { getAuthClient } = require('../utils');

module.exports = function ensureAuthenticated(req, res, next) {
  const authClient = getAuthClient(req, res);
  const { idToken, accessToken } = authClient.tokenManager.getTokensSync();
  if (idToken 
      && !authClient.tokenManager.hasExpired(idToken) 
      && accessToken
      && !authClient.tokenManager.hasExpired(accessToken)) {
    next();
  } else {
    res.redirect('/login');
  }
};
