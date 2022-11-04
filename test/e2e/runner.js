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


/* eslint-disable no-console, complexity */
const env = require('@okta/env');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
const { config } = require('./config');

env.setEnvironmentVarsFromTestEnv(__dirname);

const SPECS_TO_SKIP_IN_DOCKOLITH_TESTS = [
  'concurrent.js', 'tokens.js', 'static.js', 'originalUri.js', 'transactionStorage.js'
];

const getTask = (config) => () => {
  return new Promise(resolve => {
    // start the dev server
    const server = spawn('yarn', [
      'workspace',
      config.name,
      'start'
    ], { stdio: 'inherit' });

    waitOn({
      resources: [
        'http-get://localhost:8080'
      ]
    }).then(() => {
      // 2. run webdriver based on if sauce is needed or not
      let wdioConfig = 'wdio.conf.js';
      if (process.env.RUN_SAUCE_TESTS) {
        wdioConfig = 'sauce.wdio.conf.js';
      }
      if (process.env.RUN_CUCUMBER_TESTS) {
        const features = config.features || [];
        if (!features.length) {
          return false;
        }
        wdioConfig = 'cucumber.wdio.conf.ts';
      }

      let opts = process.argv.slice(2); // pass extra arguments through
      const runnerArgs = ['wdio', 'run', wdioConfig];
      if (process.env.RUN_CUCUMBER_TESTS) {
        (config.features || []).forEach(feature => {
          runnerArgs.push('--spec');
          runnerArgs.push(`./features/${feature}`);
        });
      } else {
        (config.spec || []).forEach(spec => {
          if (!(process.env.LOCAL_MONOLITH && SPECS_TO_SKIP_IN_DOCKOLITH_TESTS.includes(spec))) {
            runnerArgs.push('--spec');
            runnerArgs.push(`./specs/${spec}`);
          }
        });
        (config.exclude || []).forEach(spec => {
          runnerArgs.push('--exclude');
          runnerArgs.push(`./specs/${spec}`);
        });
      }
      const runner = spawn(
        'yarn',
        runnerArgs.concat(opts),
        { stdio: 'inherit' }
      );

      let returnCode = 1;
      runner.on('exit', function (code) {
        console.log('Test runner exited with code: ' + code);
        returnCode = code;
        server.kill();
      });
      runner.on('error', function (err) {
        server.kill();
        throw err;
      });
      server.on('exit', function (code) {
        console.log('Server exited with code: ' + code);
        resolve(returnCode);
      });
    });
  });
};

// Run all tests
const tasks = config
  .filter(
    process.env.TEST_NAME
      ? ({ name }) => name === process.env.TEST_NAME
      : () => true
  ).filter(
    process.env.RUN_CUCUMBER_TESTS
      ? ({ features }) => features && features.length
      : () => true
  ).map(config => getTask(config));

// track process returnCode for each task
const codes = [];
function runNextTask() {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    if (!codes.length || codes.reduce((acc, curr) => acc + curr, 0) !== 0) {
      // exit with error status if no finished task or any test fails
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    return;
  }
  const task = tasks.shift();
  task().then((code) => {
    codes.push(code);
    runNextTask();
  });
}

runNextTask();
