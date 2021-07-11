const { parallel, series, src, watch } = require('gulp');
const clean = require('gulp-clean');
const shell = require('shelljs');
const {
  install, 
  getActions, 
  getAction,
  getHygenCommand, 
  getSamplesConfig
} = require('./util');

const BUILD_DIR = '../generated';
const ACTION_OVERWRITE = 'overwrite';

const frameworks = ['react'];
const frameworkConfigMap = frameworks.reduce((map, framework) => {
  map[framework] = getSamplesConfig(framework);
  return map;
}, {});

const getCleanTask = framework => () => 
  src(`${BUILD_DIR}/samples/${framework}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));

const getWatchTask = framework => () => {
  const samplesConfig = frameworkConfigMap[framework];
  const watcher = watch(`_templates/${framework}/**/*`);
  watcher.on('all', (_, path) => {
    // get action from change path and execute build action
    const action = getAction(actions, path);
    console.info(`\nFile ${path} has been changed, build start ... \n`);
    if (action === ACTION_OVERWRITE) {
      samplesConfig
        .filter(config => path.includes(config.name))
        .forEach(config => buildAction(framework, `${ACTION_OVERWRITE}:${config.name}`, config));
    } else {
      samplesConfig.forEach(config => buildAction(framework, action, config));
    }
    
    // check if yarn install is needed
    if (path.includes('package.json')) {
      install();
    }
  });
};

const installTask = done => {
  install();
  done();
};

const buildEnv = options => {
  return new Promise((resolve, reject) => {
    const command = getHygenCommand(`yarn hygen env new`, options);
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const buildAction = (generator, action, config) => {
  return new Promise((resolve, reject) => {
    if (config.excludeAction && config.excludeAction.test(action)) {
      resolve();
      return;
    }
    const command = getHygenCommand(`yarn hygen ${generator} ${action}`, config || {});
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const getCommonBuildTasks = framework => {
  const samplesConfig = frameworkConfigMap[framework];
  const actions = getActions(framework);
  const tasks = [];
  // add build env tasks
  samplesConfig.forEach(config => {
    tasks.push(buildEnv.bind(null, config));
  });
  // add common build tasks
  samplesConfig
    .forEach(config => actions
      .filter(action => action !== ACTION_OVERWRITE)
      .forEach(action => tasks.push(
        buildAction.bind(null, framework, action, config)
      )));
  return tasks;
};

const getOverwriteBuildTasks = framework => {
  const tasks = [];
  frameworkConfigMap[framework]
    .forEach(config => tasks.push(
      buildAction.bind(null, framework, `${ACTION_OVERWRITE}:${config.name}`, config)
    ));
  return tasks;
};

const getFrameworkTasks = framework => {
  const defaultTask = series(
    getCleanTask(framework),
    parallel(...getCommonBuildTasks(framework)),
    parallel(...getOverwriteBuildTasks(framework))
  );
  return {
    [`generate:${framework}`]: defaultTask,
    [`dev:${framework}`]: series(
      defaultTask,
      installTask, 
      getWatchTask(framework)
    )
  }
};

const frameworkTasks = frameworks.reduce((tasks, framework) => {
  return { ...tasks, ...getFrameworkTasks(framework) };
}, {});

const defaultTask = series(
  parallel(
    ...Object.keys(frameworkTasks)
      .filter(key => key.startsWith('generate:'))
      .map(key => frameworkTasks[key])
  ),
  installTask
);

module.exports = {
  default: defaultTask,
  install: installTask,
  ...frameworkTasks
};
