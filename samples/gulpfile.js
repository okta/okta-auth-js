const { src, dest, parallel, series, watch, task } = require('gulp');
const through = require('through2');
const Handlebars = require('handlebars');
const handlebars = require('gulp-compile-handlebars');
const clean = require('gulp-clean');
const config = require('./config');

const SRC_DIR = 'templates';
const BUILD_DIR = 'generated';
const PARTIALS_DIR = `${SRC_DIR}/partials`;

function cleanTask() {
  return src(`${BUILD_DIR}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
}

function registerPartials() {
  return src(`${PARTIALS_DIR}/**/*`)
    .pipe(through.obj(function (file, enc, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }
      
      const id = file.relative;
      const contents = file.contents.toString();
      Handlebars.registerPartial(id, contents);

      this.push(file);
      callback();
    }));
}

function generateSampleTaskFactory(options) {
  return function generateSample() {
    const { name, template, subDir } = options;
    const inDir = `${SRC_DIR}/${template}/**/*`;
    const outDir = `${BUILD_DIR}/` + (subDir ? `${subDir}/` : '') + `${name}`;
    const hbParams = Object.assign({}, options, {
      siwVersion: config.getModuleVersion('@okta/okta-signin-widget'),
      authJSVersion: config.getModuleVersion('@okta/okta-auth-js')
    });
    console.log(`generating sample: "${name}"`, hbParams);
    return src(inDir, { dot: true })
      .pipe(handlebars(hbParams))
      .pipe(dest(outDir));
   };
}

const generateSampleTasks = config.getSampleNames().map(function(sampleName) {
  const sampleConfig = config.getSampleConfig(sampleName);
  const taskFn = generateSampleTaskFactory(sampleConfig);
  task(sampleName, series(registerPartials, taskFn));
  return taskFn;
});
const buildSamples = parallel.apply(null, generateSampleTasks);

const defaultTask = series(
  cleanTask,
  registerPartials,
  buildSamples
);

function watchSamples() {
  watch([`${PARTIALS_DIR}/**/*`, `config.js`], defaultTask);
  config.getSampleNames().map(function(sampleName) {
    const sampleConfig = config.getSampleConfig(sampleName);
    const { template } = sampleConfig;
    const task = generateSampleTaskFactory(sampleConfig);
    watch(`${SRC_DIR}/${template}/**/*`, task);
  });
}

const watchTask = series(
  defaultTask,
  watchSamples
);

module.exports = {
  default: defaultTask,
  clean: cleanTask,
  watch: watchTask
};

