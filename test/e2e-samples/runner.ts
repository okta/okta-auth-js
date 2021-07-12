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

const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
const { getSampleConfig } = require('./util/configUtils');
const config = require('@okta/samples/config');
const { react: reactSamplesConfig } = require('@okta/generator/config');

require('@okta/env').setEnvironmentVarsFromTestEnv();

const testName = process.env.SAMPLE_NAME;

function runNextTask(tasks: any) {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    return;
  }
  const task = tasks.shift();
  task().then(() => {
    runNextTask(tasks);
  });
}

function runWithConfig(sampleConfig: any) {
  const { pkgName } = sampleConfig;
  const port = sampleConfig.port || 8080;

  // 1. start the sample's web server
  const server = spawn('yarn', [
    'workspace',
    pkgName,
    'start'
  ], { stdio: 'inherit' });

  waitOn({
    resources: [
      `http-get://localhost:${port}`
    ]
  }).then(() => {
    // 2. run webdriver based on if sauce is needed or not
    let wdioConfig = 'wdio.conf.ts';
    if (process.env.RUN_SAUCE_TESTS) {
      wdioConfig = 'sauce.wdio.conf.js';
    } else if (process.env.RUN_CUCUMBER_TESTS) {
      wdioConfig = 'cucumber.wdio.conf.ts';
    }

    let opts = process.argv.slice(2); // pass extra arguments through
    const runner = spawn('./node_modules/.bin/wdio', [
      'run',
      wdioConfig
    ].concat(opts), { stdio: 'inherit' });

    let returnCode = 1;
    runner.on('exit', function (code: number) {
      console.log('Test runner exited with code: ', code);
      returnCode = code;
      server.kill();
    });
    runner.on('error', function (err: Error) {
      server.kill();
      throw err;
    });
    server.on('exit', function(code: number) {
      console.log('Server exited with code: ', code);
      // eslint-disable-next-line no-process-exit
      process.exit(returnCode);
    });
    process.on('exit', function() {
      console.log('Process exited with code: ', returnCode);
    });
  });
}

function taskFn(sampleConfig: any): Promise<void> {
  return new Promise((resolve) => {
    console.log(`Spawning runner for "${sampleConfig.pkgName}"`);
    let opts = process.argv.slice(2); // pass extra arguments through
    const runner = spawn('ts-node', [
      './runner.ts'
    ].concat(opts), { 
      stdio: 'inherit',
      env: Object.assign({}, process.env, {
        'SAMPLE_NAME': sampleConfig.pkgName
      })
    });
    runner.on('error', function (err: Error) {
      throw err;
    });
    runner.on('exit', function(code: number) {
      if (code !== 0) {
        console.log('Runner exited with code: ' + code);
        // eslint-disable-next-line no-process-exit
        process.exit(code);
      }
      resolve();
    });
  });
}

if (testName) {
  console.log(`Running starting for test "${testName}"`);
  const sampleConfig = getSampleConfig(testName);
  console.log('Starting test with config: ', sampleConfig);
  runWithConfig(sampleConfig);
} else {
  // Run all tests
  console.log(reactSamplesConfig);
  const tasks = [
    ...config.getSamplesConfig(),
    // ...reactSamplesConfig
  ].map(sampleConfig => {
    if (process.env.RUN_CUCUMBER_TESTS) {
      const features = sampleConfig.features || [];
      if (!features.length) {
        return;
      }
    } else {
      const specs = sampleConfig.specs || [];
      if (!specs.length) {
        return;
      }
    }
    return taskFn.bind(null, sampleConfig);
  })
  .filter(task => typeof task === 'function');

  runNextTask(tasks);
}
