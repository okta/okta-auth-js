const OktaAuth = require('@okta/okta-auth-js').OktaAuth;
const getConfig = require('../../config');

module.exports = function getAuthClient(req, options = {}) {
  const { transactionId } = req; // set by authTransaction middleware
  const { oidc } = getConfig().webServer;
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
      ...oidc, 
      storageManager: {
        token: {
          storageProvider
        },
        transaction: {
          storageKey: `transaction-${transactionId}`, // unique storage per transaction
          storageProvider
        },
      },
      ...options
    });
    
  } catch(e) {
    console.error('Caught exception in OktaAuth constructor: ', e);
  }
  return authClient;
};
