const { getAuthClient } = require('../utils');

module.exports = function ensureAuthenticated(req, res, next) {
  const authClient = getAuthClient(req);
  const { idToken, accessToken } = authClient.tokenManager.getTokensSync();
  if (idToken && accessToken) {
    next();
  } else {
    res.redirect('/login');
  }
};
