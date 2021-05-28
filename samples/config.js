const path = require('path');

// All samples use the same widget version, whether CDN or NPM
const SIW_VERSION = '5.5.4';

const AUTH_JS_DIR = path.dirname(require.resolve('@okta/okta-auth-js'));
const AUTH_JS_VERSION = require(path.resolve(AUTH_JS_DIR, '..', '..', 'package.json')).version;

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
  redirectPath: '/login/callback',
  flow: 'redirect',
  scopes: ['openid', 'email'],
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
    specs: ['spa-app'],
    features: []
  },
  {
    name: 'webpack-spa',
    template: 'webpack-spa',
    specs: ['spa-app'],
    features: []
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
  {
    name: 'express-direct-auth',
    template: 'express-direct-auth',
    specs: [],
    features: ['basic-auth', 'root-page']
  },
  {
    name: 'express-embedded-widget',
    template: 'express-embedded-widget',
    specs: [],
    features: []
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
