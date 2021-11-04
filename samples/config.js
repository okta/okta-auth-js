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
  mfa: true,
  authn: true,
  signinWidget: true,
  emailVerify: false // set to true once tested/ready for public release
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
    pkgName: '@okta/samples.static-spa',
    template: 'static-spa',
    specs: ['spa-app'],
    features: []
  },
  {
    name: 'webpack-spa',
    pkgName: '@okta/samples.webpack-spa',
    template: 'webpack-spa',
    specs: ['spa-app'],
    features: []
  },
  {
    name: 'express-web-no-oidc',
    pkgName: '@okta/samples.express.web-no-oidc',
    template: 'express-web',
    specs: ['web-app'],
    oidc: false
  },
  {
    name: 'express-web-with-oidc',
    pkgName: '@okta/samples.express.web-with-oidc',
    template: 'express-web',
    specs: ['web-app']
  },
  {
    name: 'express-embedded-auth-with-sdk',
    pkgName: '@okta/samples.express.embedded-auth-with-sdk',
    template: 'express-embedded-auth-with-sdk',
    specs: [],
    features: [
      'root-page', 
      'basic-auth', 
      'self-service-password-recovery', 
      'self-service-registration',
      'self-service-registration-custom-attribute',
      'mfa-password-and-email',
      'mfa-password-and-sms',
      'social-login-mfa',
      'social-idp',
      'totp'
    ],
    useEnv: true,
    express: true,
  },
  {
    name: 'express-embedded-sign-in-widget',
    pkgName: '@okta/samples.express.embedded-sign-in-widget',
    template: 'express-embedded-sign-in-widget',
    specs: [],
    features: [
      'embedded-widget-basic-auth',
      'social-idp-with-widget'
    ],
    useEnv: true
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
  return samples.map(sample => sample.name).filter(name => {
    if (process.env.SAMPLE_NAME) {
      return name === process.env.SAMPLE_NAME;
    }
    return true;
  });
}

module.exports = {
  getSampleNames,
  getSampleConfig
};
