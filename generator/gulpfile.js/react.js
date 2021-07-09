const { src, series, watch } = require('gulp');
const clean = require('gulp-clean');
const shell = require('shelljs');
const constants = require('./constants');
const { 
  getHygenCommand, 
  buildEnv, 
  getActions, 
  getAction,
  getPublishedModuleVersion,
} = require('./util');
const { react: samplesConfig } = require('../config');

const actions = getActions('react');

function buildSamples(action) {
  const buildAction = (config, action) => {
    if (config.filterPredicate(action)) {
      const command = getHygenCommand(`yarn hygen react ${action}`, config);
      shell.exec(command, code => {
        if (code !== 0) {
          throw new Error(`Failed to build templates, action: ${action}, config: ${JSON.stringify(config)}`);
        }
      });
    }
  };

  const buildSample = (config, action) => {
    if (action) {
      buildAction(config, action);
    } else {
      actions.forEach(action => buildSample(config, action));
    }
  };

  samplesConfig
    .map(config => {
      return {
        ...config,
        siwVersion: getPublishedModuleVersion('@okta/okta-signin-widget'),
        oktaReactVersion: getPublishedModuleVersion('@okta/okta-react')
      };
    })
    .forEach(config => buildSample(config, action));
}

function cleanTask() {
  return src(`${constants.buildDir}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
}

function buildTask(done) {
  samplesConfig.forEach(buildEnv);
  buildSamples();
  done();
}

function watchTask() {
  const watcher = watch('_templates/react/**/*');
  watcher.on('all', (_, path) => {
    const action = getAction(actions, path);
    console.info(`\nFile ${path} has been changed, build start ... \n`);
    buildSamples(action);
  });
}

const defaultTask = series(cleanTask, buildTask);

module.exports = {
  default: defaultTask,
  clean: cleanTask,
  build: buildTask,
  watch: watchTask,
  dev: series(defaultTask, watchTask)
};
