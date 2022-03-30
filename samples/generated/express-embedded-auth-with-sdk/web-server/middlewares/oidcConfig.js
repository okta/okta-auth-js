const getConfig = require('../../config.js');

module.exports = function oidcConfig(req, res, next) {
  const { transactionId } = req;
  const { issuer, clientId, clientSecret } = req.query;
  const { oidc: defaultConfig } = getConfig().webServer;

  // combine oidcConfigs from process.env, session and query params
  const { oidcConfig: existingOidcConfig } = req.session.transactions[transactionId];
  const newOidcConfig = req.session.transactions[transactionId].oidcConfig = {
    ...(existingOidcConfig || defaultConfig),
    ...(issuer && { issuer }),
    ...(clientId && { clientId }),
    ...(clientSecret && { clientSecret }),
  };

  // store for display purpose
  const cs = newOidcConfig.clientSecret;
  req.app.locals.oidcConfig = {
    ...newOidcConfig,
    clientSecret: '****' + cs.substr(cs.length - 4, 4)
  };

  next();
};
