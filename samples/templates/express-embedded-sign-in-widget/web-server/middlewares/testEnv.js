const env = require('../../env')();

module.exports = function testEnv(req, res, next) {
  const { testenv } = req.query;
  if (testenv) {
    env.setEnvironmentVarsFromTestEnvYaml(testenv);
  }
  next();
};
