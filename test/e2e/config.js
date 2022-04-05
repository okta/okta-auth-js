const config = [
  {
    name: '@okta/test.app',
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
    ]
  },
  {
    name: '@okta/test.app.react-mfa-v1',
    spec: [
      'mfa.js'
    ]
  },
];

module.exports = {
  config
};
