const OktaEnv = require('@okta/env');
const { toQueryString } = require('../src/util');

function testenvMiddleware(req, res) {
  const config = JSON.parse(req.body.config);
  OktaEnv.setEnvironmentVarsFromTestEnv(__dirname);
  const qs = toQueryString(Object.assign({}, config, {
    status: 'testenv reloaded!',
  }));
  console.log('Reloading the page.');
  res.redirect('/server' + qs);
}

module.exports = {
  testenvMiddleware,
};
