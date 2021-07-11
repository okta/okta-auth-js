const fs = require('fs');
const { src } = require('gulp');
const clean = require('gulp-clean');
const path = require('path');
const shell = require('shelljs');

const constants = require('./constants');

const getDestDir = config => `${constants.buildDir}/${config.dest}/${config.name}`;

const getHygenCommand = (base, options) => {
  return Object.keys(options).reduce((acc, curr) => {
    acc += ` --${curr} "${options[curr]}"`;
    return acc;
  }, base);
};

const buildEnv = (config) => {
  return new Promise((resolve, reject) => {
    const command = getHygenCommand(`yarn hygen env new`, config);
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const getActions = generator => {
  const p = path.join(__dirname, '..', `_templates/${generator}`);
  return fs.readdirSync(p).filter((file) => {
    return fs.statSync(p + '/' + file).isDirectory();
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
}

const getCleanTask = dir => () => 
  src(dir, { read: false, allowEmpty: true }).pipe(clean({ force: true }));

module.exports = {
  getDestDir,
  getHygenCommand,
  buildEnv,
  getActions,
  getAction,
  getPublishedModuleVersion,
  install,
  getCleanTask
};
