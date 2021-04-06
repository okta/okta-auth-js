const crypto = require('crypto');
const OktaAuth = require('@okta/okta-auth-js').OktaAuth;

const sampleConfig = require('../../config').webServer;

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
};

module.exports = function getAuthClient() {
  let authClient;
  try {
    authClient = new OktaAuth({ 
      ...sampleConfig.oidc, 
      storageManager: {
        transaction: {
          storageKey: 'transaction-' + uniqueId()
        }
      }
    });
  } catch(e) {
    console.error('Caught exception in OktaAuth constructor: ', e);
  }
  return authClient;
}
