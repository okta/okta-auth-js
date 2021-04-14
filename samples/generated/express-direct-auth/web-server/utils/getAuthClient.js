const OktaAuth = require('@okta/okta-auth-js').OktaAuth;

const sampleConfig = require('../../config').webServer;

module.exports = function getAuthClient(req, options = {}) {
  const storageProvider = {
    getItem: function(key) {
      let val;
      try {
        val = JSON.parse(req.session[key]);
      } catch (err) {
        val = null;
      }
      return val;
    },
    setItem: function(key, val) {
      req.session[key] = JSON.stringify(val);
    },
    removeItem: function(key) {
      delete req.session[key];
    }
  };

  let authClient;
  try {
    authClient = new OktaAuth({ 
      ...sampleConfig.oidc, 
      storageManager: {
        token: {
          storageProvider
        },
        transaction: {
          storageProvider
        }
      },
      ...options
    });
  } catch(e) {
    console.error('Caught exception in OktaAuth constructor: ', e);
  }
  return authClient;
};
