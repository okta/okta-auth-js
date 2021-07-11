const react = require('./react');

const testConfig = {
  port: 8080
};

const mergeTestConfig = (configs) => {
  return configs.map(config => {
    return { ...config, ...testConfig };
  });
};

module.exports = {
  react: mergeTestConfig(react)
};
