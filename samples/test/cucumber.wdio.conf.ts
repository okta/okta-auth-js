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

const fs = require('fs');
const path = require('path');
const { mergeFiles } = require('junit-report-merger');

require('@okta/env').setEnvironmentVarsFromTestEnv(__dirname);
require('@babel/register'); // Allows use of import module syntax
require('regenerator-runtime'); // Allows use of async/await

const configUtils = require('./util/configUtils');
const specs = configUtils.getSampleFeatures();
console.log('SPECS', specs);

const USE_FIREFOX = !!process.env.USE_FIREFOX;
const DEBUG = process.env.DEBUG;
const CI = process.env.CI;
const LOG = process.env.LOG;
const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;
const logLevel = LOG || 'warn';
const chromeOptions = {
    args: []
};
const firefoxOptions = {
  args: []
};
const maxInstances = process.env.MAX_INSTANCES ? +process.env.MAX_INSTANCES : 1;

if (CI) {
    if (process.env.CHROME_BINARY) {
      chromeOptions.binary = process.env.CHROME_BINARY
    }
    chromeOptions.args = chromeOptions.args.concat([
        '--headless',
        '--disable-gpu',
        '--window-size=1600x1200',
        '--no-sandbox',
        '--whitelisted-ips',
        '--disable-extensions',
        '--verbose'
    ]);
    firefoxOptions.args = firefoxOptions.args.concat([
        '-headless'
    ]);
}

 // If you are using Cucumber you need to specify the location of your step definitions.
const cucumberOpts: WebdriverIO.CucumberOpts = {
  // <boolean> show full backtrace for errors
  backtrace: false,
  // <string[]> module used for processing required features
  requireModule: [],
  // <boolean< Treat ambiguous definitions as errors
  failAmbiguousDefinitions: true,
  // <boolean> invoke formatters without executing steps
  // dryRun: false,
  // <boolean> abort the run on first failure
  failFast: false,
  // <boolean> Enable this config to treat undefined definitions as
  // warnings
  ignoreUndefinedDefinitions: false,
  // <string[]> ("extension:module") require files with the given
  // EXTENSION after requiring MODULE (repeatable)
  names: [],
  // <boolean> hide step definition snippets for pending steps
  snippets: true,
  // <boolean> hide source uris
  source: true,
  // <string[]> (name) specify the profile to use
  profile: [],
  // <string[]> (file/dir) require files before executing features
  require: [
      './steps/before.ts',
      './steps/after.ts',
      './steps/given.ts',
      './steps/then.ts',
      './steps/when.ts',
      // Or search a (sub)folder for JS files with a wildcard
      // works since version 1.1 of the wdio-cucumber-framework
      // './src/**/*.js',
  ],
  scenarioLevelReporter: false,
  order: 'defined',
  // <string> specify a custom snippet syntax
  snippetSyntax: undefined,
  // <boolean> fail if there are any undefined or pending steps
  strict: true,
  // <string> (expression) only execute the features or scenarios with
  // tags matching the expression, see
  // https://docs.cucumber.io/tag-expressions/
  // tagExpression: 'not @Pending',
  tags: 'not @Pending',
  // <boolean> add cucumber tags to feature or scenario name
  // tagsInTitle: false,
  // <number> timeout for step definitions
  timeout: defaultTimeoutInterval,
};

export const config: WebdriverIO.Config = {

    // ====================
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',
    //
    // Override default path ('/wd/hub') for chromedriver service.
    path: '/',
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs,

    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 1,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instances available you can make sure that not more than
        // 5 instances get started at a time.
        maxInstances, // a18n api has very limited capacity, leave space for parallel CI/local processes
        //
        browserName: USE_FIREFOX ? 'firefox' : 'chrome',
        'goog:chromeOptions': chromeOptions,
        'moz:firefoxOptions': firefoxOptions,
        // If outputDir is provided WebdriverIO can capture driver session logs
        // it is possible to configure which logTypes to include/exclude.
        // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
        // excludeDriverLogs: ['bugreport', 'server'],
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel,
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner, @wdio/lambda-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/applitools-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost:8080',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    // services: [
    //   ['selenium-standalone', {
    //     installArgs: {
    //       drivers
    //     },
    //     args: {
    //       drivers
    //     }
    //   }]
    // ],
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'cucumber',

    cucumberOpts,
    //
    // The number of times to retry the entire specfile when it fails as a whole
    // specFileRetries: 1,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter.html
    reporters: [
      'spec',
      ['junit', {
        outputDir: './reports',
        outputFileFormat(options: { cid: string }) {
          return `results-${options.cid}.xml`;
        }
      }]
    ],

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onPrepare: function (config, capabilities) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // beforeSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // before: function (capabilities, specs) {
    // },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    // beforeSuite: function (suite) {
    // },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    // beforeTest: function (test, context) {
    // },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    // beforeHook: function (test, context) {
    // },
    /**
     * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
     * afterEach in Mocha)
     */
    // afterHook: function (test, context, { error, result, duration, passed }) {
    // },
    /**
     * Function to be executed after a test (in Mocha/Jasmine).
     */
    // afterTest: function(test, context, { error, result, duration, passed }) {
    // },


    /**
     * Hook that gets executed after the suite has ended
     * @param {Object} suite suite details
     */
    // afterSuite: function (suite) {
    // },
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    // onComplete: async function(exitCode, config, capabilities, results) {
    //   const outputDir = path.join(__dirname, '../../build2/reports/e2e');
    //   fs.mkdirSync(outputDir, { recursive: true });
    //   const reportsDir = path.resolve(__dirname, 'reports');
    //   await mergeFiles(path.resolve(outputDir, 'junit-results.xml'), ['./reports/*.xml']);
    //   fs.rmdirSync(reportsDir, { recursive: true });
    // },
    /**
    * Gets executed when a refresh happens.
    * @param {String} oldSessionId session ID of the old session
    * @param {String} newSessionId session ID of the new session
    */
    //onReload: function(oldSessionId, newSessionId) {
    //}
};
