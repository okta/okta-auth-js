const path = require('path');
const AUTH_JS_DIR = path.dirname(require.resolve('@okta/okta-auth-js'));
const AUTH_JS_VERSION = require(path.resolve(AUTH_JS_DIR, '..', '..', 'package.json')).version;
const SIW_DIR = path.dirname(require.resolve('@okta/okta-signin-widget'));
const SIW_VERSION = require(path.resolve(SIW_DIR, '..', '..', 'package.json')).version;

const versions = {
  '@okta/okta-auth-js': AUTH_JS_VERSION,
  '@okta/okta-signin-widget': SIW_VERSION
};

function getModuleVersion(moduleName) {
  return versions[moduleName];
}

const defaults = {
  port: '8080'
};

const spaDefaults = Object.assign({
  redirectPath: '/implicit/callback',
  flow: 'redirect',
  storage: 'sessionStorage',
  requireUserSession: true,
  signinForm: true,
  signinWidget: true
}, defaults);

const webDefaults = Object.assign({
  redirectPath: '/authorization-code/callback',
  oidc: true
}, defaults);

const templateDefaults = {
  'static-spa': Object.assign({
    webpack: false
  }, spaDefaults),
  'webpack-spa': Object.assign({
    webpack: true
  }, spaDefaults),
  'express-web': Object.assign({
    express: true
  }, webDefaults)
};

const samples = [
  {
    name: 'static-spa',
    template: 'static-spa',
    specs: ['spa-app']
  },
  {
    name: 'webpack-spa',
    template: 'webpack-spa',
    specs: ['spa-app'],
  },
  {
    name: 'express-web-no-oidc',
    template: 'express-web',
    specs: ['web-app'],
    oidc: false
  },
  {
    name: 'express-web-with-oidc',
    template: 'express-web',
    specs: ['web-app']
  },
].map(function(sampleConfig) {
  if (!sampleConfig.name) {
    throw new Error('sample "name" is required');
  }
  if (!sampleConfig.template) {
    throw new Error('sample "template" is required');
  }
  const mergedConfig = Object.assign({}, templateDefaults[sampleConfig.template], sampleConfig);
  return mergedConfig;
});

function getSampleConfig(sampleName) {
  const configEntries = samples.filter(val => val.name === sampleName);
  const sampleConfig = configEntries.length ? configEntries[0] : null;
  return sampleConfig;
}

function getSampleNames() {
  return samples.map(sample => sample.name);
}

module.exports = {
  getModuleVersion,
  getSampleNames,
  getSampleConfig
};