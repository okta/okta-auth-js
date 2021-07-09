const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const constants = require('./constants');

const getDestDir = config => `${constants.buildDir}/${config.dest}/${config.name}`;

const getHygenCommand = (base, config) => {
  return Object.keys(config).reduce((acc, curr) => {
    if (curr !== 'filterPredicate') {
      acc += ` --${curr} "${config[curr]}"`;
    }
    return acc;
  }, base);
};

const buildEnv = (config) => {
  const command = getHygenCommand(`yarn hygen env new`, config);
  shell.exec(command);
};

const getActions = generator => {
  const p = path.join(__dirname, '..', `_templates/${generator}`);
  const actions = fs.readdirSync(p).filter((file) => {
    return fs.statSync(p + '/' + file).isDirectory();
  });
  // move "overwrite" action to the end of array
  actions.push(actions.splice(actions.indexOf('overwrite'), 1)[0]);
  return actions;
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

module.exports = {
  getDestDir,
  getHygenCommand,
  buildEnv,
  getActions,
  getAction,
  getPublishedModuleVersion
};
