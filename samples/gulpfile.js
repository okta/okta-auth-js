/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


const { src, dest, parallel, series, watch, task } = require('gulp');
const through = require('through2');
const Handlebars = require('handlebars');
const handlebars = require('gulp-compile-handlebars');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const shell = require('shelljs');
const merge = require('merge-stream');

const config = require('./config');

const SRC_DIR = 'templates';
const BUILD_DIR = 'generated';
const PARTIALS_DIR = `${SRC_DIR}/partials`;
const OKTA_ENV_SCRIPT_PATH = '../env/index.js';

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
    const { name, template, subDir, useEnv } = options;
    const inDir = `${SRC_DIR}/${template}/**/*`;
    const viewTemplatesDir = `${SRC_DIR}/${template}/**/views/*`;
    const outDir = `${BUILD_DIR}/` + (subDir ? `${subDir}/` : '') + `${name}`;
    const strOptions = {};
    Object.keys(options).forEach(key => {
      let val = options[key];
      if (Array.isArray(val) || typeof val === 'object') {
        val = JSON.stringify(val).replace(/"/g, '\'');
      }
      strOptions[key] = val;
    });

    const hbParams = Object.assign({}, strOptions, {
      siwVersion: config.getModuleVersion('@okta/okta-signin-widget'),
      authJSVersion: getPublishedAuthJSVersion()
    });
    console.log(`generating sample: "${name}"`, hbParams);
    const generateWithoutViewTemplates = src([inDir, `!${viewTemplatesDir}`], { dot: true })
      .pipe(handlebars(hbParams))
      .pipe(dest(outDir));
    const copyViewTemplates = src(viewTemplatesDir, { dot: true })
      .pipe(dest(outDir));
    const merged = merge(generateWithoutViewTemplates, copyViewTemplates);
    if (useEnv) {
      const copyEnvModule = src(OKTA_ENV_SCRIPT_PATH, { dot: true })
        .pipe(rename('okta-env.js'))
        .pipe(dest(`${outDir}/env/`));
      merged.add(copyEnvModule);
    }
    return merged;
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

function getPublishedAuthJSVersion(cb) {
  const stdout = shell.exec('yarn info @okta/okta-auth-js versions', { silent: true });
  const arrayStr = stdout.substring(stdout.indexOf('['), stdout.lastIndexOf(']') + 1).replace(/'/g, '"');
  const versions = JSON.parse(arrayStr);
  const authJSVersion = versions[versions.length - 1];
  console.log('Last published okta-auth-js version: ', authJSVersion);
  cb && cb();
  return authJSVersion;
}

module.exports = {
  default: defaultTask,
  clean: cleanTask,
  watch: watchTask,
  getPublishedAuthJSVersion
};

