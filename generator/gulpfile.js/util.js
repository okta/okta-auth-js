const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const config = require('../config');

const getHygenCommand = (base, options) => {
  return Object.keys(options).reduce((acc, curr) => {
    acc += ` --${curr} "${options[curr]}"`;
    return acc;
  }, base);
};

const getActions = framework => {
  const dir = path.join(__dirname, '..', `_templates/${framework}`);
  return fs.readdirSync(dir).filter((file) => {
    return fs.statSync(dir + '/' + file).isDirectory();
  });
};

const getAction = (actions, path) => {
  for (let action of actions) {
    if (path.includes(`/${action}`)) {
      return action;
    }
  }
  throw new Error('unknow path', path);
};

const getPublishedModuleVersion = (module, cb) => {
  const stdout = shell.exec(`yarn info ${module} dist-tags --json`, { silent: true });
  const distTags = JSON.parse(stdout);
  const version = distTags.data.latest;
  console.log(`Last published ${module} version: `, version);
  cb && cb();
  return version;
};

const install = () => {
  shell.exec('yarn install --ignore-scripts');
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getSamplesConfig = framework => {
  const versions = {
    siwVersion: getPublishedModuleVersion('@okta/okta-signin-widget'),
    [`okta${capitalizeFirstLetter(framework)}Version`]: getPublishedModuleVersion(`@okta/okta-${framework}`)
  };
  return config[framework].map(config => {
    const pkgNameParts = config.pkgName.split('.');
    const name = pkgNameParts[pkgNameParts.length - 1];
    const dest = `samples/${framework}/${name}`;
    return { ...config, ...versions, name, dest };
  });
};

module.exports = {
  getHygenCommand,
  getActions,
  getAction,
  getPublishedModuleVersion,
  install,
  getSamplesConfig
};
