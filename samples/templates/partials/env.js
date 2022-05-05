module.exports = function () {
  let oktaEnv;
  try {
    oktaEnv = require('@okta/test.support/env');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      // try local env module
      oktaEnv = require('./okta-env');
      return oktaEnv;
    }

    throw err;
  }
  
  return oktaEnv;
};
