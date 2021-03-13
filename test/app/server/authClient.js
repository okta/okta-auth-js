// eslint-disable-next-line node/no-unpublished-require
const OktaAuth = require('../../../build/cjs/index').OktaAuth;

module.exports = function getAuthClient(options) {
  let authClient;
  try {
    authClient = new OktaAuth(options);
  } catch(e) {
    console.error('Caught exception in OktaAuth constructor: ', e);
  }
  return authClient;
};
