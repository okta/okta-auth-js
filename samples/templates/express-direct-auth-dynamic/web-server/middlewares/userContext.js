const { getAuthClient } = require('../utils');

module.exports = async function userContext(req, res, next) {
  const authClient = getAuthClient(req);
  const { idToken, accessToken, refreshToken } = authClient.tokenManager.getTokensSync();
  if (idToken && accessToken) {
    const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
    req.userContext = { 
      userinfo, 
      tokens: { 
        idToken, accessToken, refreshToken 
      } 
    };
  }
  
  next();
};
