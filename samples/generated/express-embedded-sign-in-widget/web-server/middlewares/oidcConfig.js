const getConfig = require('../../config.js');

module.exports = function oidcConfig(req, res, next) {
  const { issuer, clientId, clientSecret } = req.query;
  const { oidc: defaultConfig } = getConfig().webServer;

  // store for auth client initialization
  req.session.oidcConfig = {
    ...(req.session.oidcConfig || defaultConfig),
    ...(issuer && { issuer }),
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
  };

  // store for display purpose
  const cs = req.session.oidcConfig.clientSecret;
  req.app.locals.oidcConfig = {
    ...req.session.oidcConfig,
    clientSecret: '****' + cs.substr(cs.length - 4, 4)
  };

  next();
};
