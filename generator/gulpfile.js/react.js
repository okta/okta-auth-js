const { series, watch, parallel } = require('gulp');
const shell = require('shelljs');
const constants = require('./constants');
const { 
  getHygenCommand, 
  buildEnv, 
  getActions, 
  getAction,
  getPublishedModuleVersion,
  install,
  getCleanTask
} = require('./util');
const { react: samplesConfig } = require('../config');

const CONTEXT = 'react';

const versions = {
  siwVersion: getPublishedModuleVersion('@okta/okta-signin-widget'),
  oktaReactVersion: getPublishedModuleVersion('@okta/okta-react')
};
const actions = getActions(CONTEXT);

const getSamplesConfig = () => samplesConfig.map(config => {
  const parts = config.pkgName.split('.');
  const name = parts[parts.length - 1];
  const dest = `samples/${CONTEXT}/${name}`;
  return { ...config, ...versions, name, dest };
});

const buildAction = (action, config) => {
  return new Promise((resolve, reject) => {
    if (config.excludeAction.test(action)) {
      resolve();
      return;
    }
    const command = getHygenCommand(`yarn hygen ${CONTEXT} ${action}`, config || {});
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const cleanTask = getCleanTask(`${constants.buildDir}/samples/${CONTEXT}`);

const getCommonBuildTasks = () => {
  const tasks = [];
  // add build env tasks
  getSamplesConfig().forEach(config => {
    tasks.push(buildEnv.bind(null, config));
  });
  // add common build tasks
  getSamplesConfig()
    .forEach(config => {
      actions
        .filter(action => action !== constants.actionOverwrite)
        .forEach(action => tasks.push(buildAction.bind(null, action, config)));
    });
  return tasks;
};

const getOverwriteBuildTasks = () => {
  const tasks = [];
  getSamplesConfig()
    .forEach(config => tasks.push(buildAction.bind(null, `${constants.actionOverwrite}:${config.name}`, config)));
  return tasks;
};

function watchTask() {
  const watcher = watch(`_templates/${CONTEXT}/**/*`);
  watcher.on('all', (_, path) => {
    // get action from change path and execute build action
    const action = getAction(actions, path);
    console.info(`\nFile ${path} has been changed, build start ... \n`);
    if (action === constants.actionOverwrite) {
      getSamplesConfig()
        .filter(config => path.includes(config.name))
        .forEach(config => buildAction(`${constants.actionOverwrite}:${config.name}`, config));
    } else {
      getSamplesConfig().forEach(config => buildAction(action, config));
    }
    
    // check if yarn install is needed
    if (path.includes('package.json')) {
      install();
    }
  });
}

function installTask(done) {
  install();
  done();
}

const defaultTask = series(
  cleanTask,
  parallel(...getCommonBuildTasks()),
  parallel(...getOverwriteBuildTasks()),
  installTask
);

module.exports = {
  default: defaultTask,
  clean: getCleanTask,
  watch: watchTask,
  dev: series(defaultTask, watchTask)
};
