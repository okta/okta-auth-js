module.exports = function () {
  let oktaEnv;
  try {
    oktaEnv = require('@okta/env');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      // try local env module
      oktaEnv = require('./okta-env');
    }

    throw err;
  }
  
  return oktaEnv;
};
