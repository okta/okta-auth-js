const dotenv = require('dotenv');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..');

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(ROOT_DIR, 'testenv');

// Multiple sets of environment variables can be stored in a file called "testenv.yml"
const TESTENV_YAML = path.resolve(ROOT_DIR, 'testenv.yml');

if (fs.existsSync(TESTENV)) {
  setEnvironmentVarsFromTestEnv();
}

function setEnvironmentVars(envConfig) {
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });  
}

function setEnvironmentVarsFromTestEnv() {
  if (!fs.existsSync(TESTENV)) {
    return;
  }
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  setEnvironmentVars(envConfig);
}

function setEnvironmentVarsFromTestEnvYaml(name) {
  if (!fs.existsSync(TESTENV_YAML)) {
    return;
  }

  const doc = yaml.load(fs.readFileSync(TESTENV_YAML));
  if (doc[name]) {
    setEnvironmentVars(doc[name]);
  } else {
    throw new Error(`cannot load test environment by name: "${name}". Make sure this entry exists in "testenv.yml".`);
  }
}

module.exports = {
  setEnvironmentVars,
  setEnvironmentVarsFromTestEnv,
  setEnvironmentVarsFromTestEnvYaml
};
