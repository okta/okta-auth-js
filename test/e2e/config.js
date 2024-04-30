const config = [
  {
    name: 'e2e',
    app: '@okta/test.app',
    spec: [
      'authRequired.js',
      'concurrent.js',
      'crossTabs.js',
      'interactionFlow.js',
      'login.js',
      'logout.js',
      'originalUri.js',
      'proxy.js',
      'refreshToken.js',
      'server.js',
      'sso.js',
      'static.js',
      'tokens.js',
      'transactionStorage.js'
    ],
    features: [
      'login.feature',
      'acr-values.feature',
      'enroll-authenticator.feature',
    ]
  },
  {
    name: 'e2e-mfa',
    app: '@okta/test.app.react-mfa-v1',
    spec: [
      'mfa.js'
    ]
  },
  {
    name: 'e2e-dpop',
    app: '@okta/test.app',
    spec: [
      'dpop.js'
    ],
  },
];

module.exports = {
  config
};
