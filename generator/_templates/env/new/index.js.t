---
to: ../generated/<%= dest %>/<%= name %>/env/index.js
force: true
---
module.exports = function () {
  let oktaEnv;
  try {
    oktaEnv = require('@okta/env');
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
