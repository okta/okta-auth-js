const { src, series, watch } = require('gulp');
const clean = require('gulp-clean');
const shell = require('shelljs');
const constants = require('./constants');
const { 
  getHygenCommand, 
  buildEnv, 
  getActions, 
  getAction
} = require('./util');

const actions = getActions('react');
const samplesConfig = [
  {
    name: 'custom-login',
    dest: 'react',
    type: 'github',
    header: 'PKCE Flow w/ Custom Login',
    filterPredicate: action => action !== 'doc-src'
  },
  {
    name: 'okta-hosted-login',
    dest: 'react',
    type: 'github',
    header: 'PKCE Flow w/ Okta Hosted Login Page',
    filterPredicate: action => action !== 'doc-src'
  },
  {
    name: 'signin-widget',
    dest: 'react',
    type: 'doc',
    filterPredicate: action => action !== 'github-src'
  },
  {
    name: 'auth-js-no-oidc',
    dest: 'react',
    type: 'doc',
    filterPredicate: action => action !== 'github-src'
  }
];

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

  function buildSample(config, action) {
    if (action) {
      buildAction(config, action);
    } else {
      actions.forEach(action => buildSample(config, action));
    }
  };

  samplesConfig.forEach(config => buildSample(config, action));
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
