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

const GENERATE_TYPE_FULL = 'full';
const GENERATE_TYPE_OVERWRITE = 'overwrite';

const defaults = {
  port: '8080'
};

const spaDefaults = Object.assign({
  redirectPath: '/login/callback',
  authMethod: 'form',
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
    name: '@okta/samples.static-spa',
    appType: 'browser',
    template: 'static-spa',
    generateType: GENERATE_TYPE_FULL,
    specs: ['spa-app'],
    features: []
  },
  {
    name: '@okta/samples.webpack-spa',
    appType: 'browser',
    template: 'webpack-spa',
    generateType: GENERATE_TYPE_FULL,
    specs: ['spa-app'],
    features: []
  },
  {
    name: '@okta/samples.express-web-no-oidc',
    appType: 'web',
    template: 'express-web',
    generateType: GENERATE_TYPE_FULL,
    specs: ['web-app'],
    oidc: false
  },
  {
    name: '@okta/samples.express-web-with-oidc',
    appType: 'web',
    template: 'express-web',
    generateType: GENERATE_TYPE_FULL,
    specs: ['web-app']
  },
  {
    name: '@okta/samples.express-embedded-auth-with-sdk',
    appType: 'web',
    template: 'express-embedded-auth-with-sdk',
    generateType: GENERATE_TYPE_OVERWRITE,
    specs: ['express-embedded-auth-with-sdk'],
    features: [
      // group sms related specs together, so they do not run in parallel
      // this spec takes time to finish, run it first
      [
        'self-service-registration',
        'mfa-password-and-sms',
      ],
      'root-page', 
      'basic-auth', 
      'identifier-first-auth',
      'self-service-password-recovery', 
      'self-service-registration-custom-attribute',
      'self-service-registration-activation-token',
      'mfa-password-and-email',
      'mfa-password-and-email-magic-link',
      'mfa-password-and-question',
      // This feature is not well defined and introduce flakiness, disable it
      // 'social-login-mfa',
      'totp-signup',
      'totp-signin',
      'security-questions-enrollment',
      // TODO: enable test OKTA-597533
      // 'self-service-registration-password-optional',
      'account-unlock',
      'totp-okta-verify-signup',
      'totp-okta-verify-signin',
      'webauthn-signup',
      'mfa-password-and-webauthn',
    ],
    useEnv: true,
  },
  {
    name: '@okta/samples.express-embedded-sign-in-widget',
    appType: 'web',
    template: 'express-embedded-sign-in-widget',
    generateType: GENERATE_TYPE_OVERWRITE,
    specs: [],
    features: [
      'embedded-widget-basic-auth',
      'social-idp-with-widget'
    ],
    useEnv: true
  },
  {
    name: '@okta/samples.react-embedded-auth-with-sdk',
    appType: 'browser',
    template: 'react-embedded-auth-with-sdk',
    generateType: GENERATE_TYPE_OVERWRITE,
    features: [
      // group sms related specs together, so they do not run in parallel
      // this spec takes time to finish, run it first
      [
        'progressive-profiling-manage-phone-numbers',
      ],
      'basic-auth',
      'progressive-profiling-view-profile',
      'progressive-profiling-update-profile-info',
      'progressive-profiling-update-email-address',
      'progressive-profiling-acr-values',
    ],
    useEnv: true
  },
].map(function(sampleConfig) {
  if (!sampleConfig.name) {
    throw new Error('sample "name" is required');
  }
  const mergedConfig = Object.assign({}, templateDefaults[sampleConfig.template], sampleConfig);
  return mergedConfig;
});

function getSampleConfig(sampleName) {
  const configEntries = samples.filter(val => val.name === sampleName);
  const sampleConfig = configEntries.length ? configEntries[0] : null;
  return sampleConfig;
}

function getSamplesConfig() {
  return samples;
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
  getSampleConfig,
  getSamplesConfig,
  GENERATE_TYPE_FULL,
  GENERATE_TYPE_OVERWRITE
};
