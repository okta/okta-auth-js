import type { Options } from '@wdio/types';
import type { WebdriverIO } from '@wdio/types/build/Options';
const wdioConfig = require('./wdio.conf');
const { capabilities, services, ...conf } = wdioConfig.config;

const DEBUG = process.env.DEBUG;

const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;

const cucumberOpts: WebdriverIO.CucumberOpts = {
  // <string[]> (file/dir) require files before executing features
  require: ['./features/step-definitions/steps.ts'],
  // <boolean> show full backtrace for errors
  backtrace: false,
  // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
  requireModule: [],
  // <boolean> invoke formatters without executing steps
  dryRun: false,
  // <boolean> abort the run on first failure
  failFast: false,
  // <boolean> hide step definition snippets for pending steps
  snippets: true,
  // <boolean> hide source uris
  source: true,
  // <boolean> fail if there are any undefined or pending steps
  strict: false,
  // <string> (expression) only execute the features or scenarios with tags matching the expression
  tagExpression: '',
  // <number> timeout for step definitions
  timeout: defaultTimeoutInterval,
  // <boolean> Enable this config to treat undefined definitions as warnings.
  ignoreUndefinedDefinitions: false
};

export const config: Options.Testrunner = {
  ...conf,
  autoCompileOpts: {
    autoCompile: true,
    // see https://github.com/TypeStrong/ts-node#cli-and-programmatic-options
    // for all available options
    tsNodeOpts: {
      transpileOnly: true,
      project: 'tsconfig.json'
    }
    // tsconfig-paths is only used if "tsConfigPathsOpts" are provided, if you
    // do please make sure "tsconfig-paths" is installed as dependency
    // tsConfigPathsOpts: {
    //     baseUrl: './'
    // }
  },
  capabilities,
  baseUrl: 'http://localhost',
  connectionRetryTimeout: 120000,
  services,   
  framework: 'cucumber',
  reporters: ['spec'],
  cucumberOpts,
  jasmineOpts: {}   // not needed for this config, override defaults
};
