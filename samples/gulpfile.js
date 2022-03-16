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
const path = require('path');
const fs = require('fs');

const { 
  getSampleNames, 
  getSampleConfig,
  GENERATE_TYPE_FULL,
  GENERATE_TYPE_OVERWRITE
} = require('./config');

Handlebars.registerHelper('append', (str) => str);

const SRC_DIR = 'templates';
const BUILD_DIR = 'generated';
const PARTIALS_DIR = `${SRC_DIR}/partials`;
const OKTA_ENV_SCRIPT_PATH = '../env/index.js';
const GIT_ATTRIBUTES_PATH = '.gitattributes';

const versionsCache = {
  siwVersion: process.env.SIW_VERSION || getPublishedModuleVersion('@okta/okta-signin-widget'),
  authJSVersion: getPublishedModuleVersion('@okta/okta-auth-js')
};
const gitattributes = (() => {
  const arr = fs.readFileSync(GIT_ATTRIBUTES_PATH)
    .toString()
    .split('\n')
    .map(str => str.trim())
    .filter(str => !!str);
  return new Set(arr);
})();

function cleanTask() {
  const dirs = getSampleNames()
    .map(name => getSampleConfig(name))
    .filter(config => config.generateType === GENERATE_TYPE_FULL)
    .map(({ name }) => path.join(BUILD_DIR, name));
  return src(dirs, { read: false, allowEmpty: true })
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
    const { name, template, subDir, useEnv, generateType } = options;
    const outFolder = (() => {
      const parts = name.split('.');
      return parts[parts.length - 1];
    })();
    const inDir = `${SRC_DIR}/${template}/**/*`;
    const outDir = `${BUILD_DIR}/` + (subDir ? `${subDir}/` : '') + `${outFolder}`;
    const strOptions = {};
    Object.keys(options).forEach(key => {
      let val = options[key];
      if (Array.isArray(val) || typeof val === 'object') {
        val = JSON.stringify(val).replace(/"/g, '\'');
      }
      strOptions[key] = val;
    });

    if (generateType === GENERATE_TYPE_FULL) {
      gitattributes.add(`${outDir}/**/* linguist-generated=true`);
    }

    const hbParams = Object.assign({}, strOptions, versionsCache);
    console.log(`generating sample: "${name}"`, hbParams);
    const generateTemplates = src(inDir, { dot: true })
      .pipe(handlebars(hbParams))
      .pipe(dest((file) => {
        if (generateType === GENERATE_TYPE_OVERWRITE) {
          gitattributes.add(`${outDir}${file.path.split(outFolder)[1]} linguist-generated=true`);
        }
        return outDir;
      }));
    const merged = merge(generateTemplates);
    if (useEnv) {
      const copyEnvModule = src(OKTA_ENV_SCRIPT_PATH, { dot: true })
        .pipe(rename('okta-env.js'))
        .pipe(dest(() => {
          gitattributes.add(`${outDir}/env/okta-env.js linguist-generated=true`);
          return `${outDir}/env/`;
        }));
      merged.add(copyEnvModule);
    }
    return merged;
   };
}

const generateSampleTasks = getSampleNames().map(function(sampleName) {
  const sampleConfig = getSampleConfig(sampleName);
  const taskFn = generateSampleTaskFactory(sampleConfig);
  task(sampleConfig.name, series(registerPartials, taskFn));
  return taskFn;
});
const buildSamples = parallel.apply(null, generateSampleTasks);

function writeGitAttributes(done) {
  fs.writeFileSync(
    GIT_ATTRIBUTES_PATH, 
    Array.from(gitattributes).reduce((acc, curr) => {
      acc += curr + '\n';
      return acc;
    }, '')
  );
  done();
}

const defaultTask = series(
  cleanTask,
  registerPartials,
  buildSamples,
  writeGitAttributes
);

function watchSamples() {
  watch([`${PARTIALS_DIR}/**/*`, `config.js`], defaultTask);
  getSampleNames().map(function(sampleName) {
    const sampleConfig = getSampleConfig(sampleName);
    const { template } = sampleConfig;
    const task = generateSampleTaskFactory(sampleConfig);
    watch(`${SRC_DIR}/${template}/**/*`, task);
  });
}

const watchTask = series(
  defaultTask,
  watchSamples
);

function getPublishedModuleVersion(module, cb) {
  const stdout = shell.exec(`yarn info ${module} dist-tags --json`, { silent: true });
  const distTags = JSON.parse(stdout);
  const version = distTags.data.latest;
  console.log(`Last published ${module} version: `, version);
  cb && cb();
  return version;
}

module.exports = {
  default: defaultTask,
  clean: cleanTask,
  watch: watchTask,
  getPublishedModuleVersion
};

