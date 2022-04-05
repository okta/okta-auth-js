const REFRESH_TOKEN = 'REFRESH_TOKEN';
const MFA_ENABLED = 'MFA_ENABLED';
const ORG_OIE_ENABLED = 'ORG_OIE_ENABLED';

const config = [
  {
    app: '@okta/test.app',
    spec: [
      '**/login.js'
    ],
    exclude: [
      'mfa.js'
    ],
    flags: [ORG_OIE_ENABLED]
  },
  {
    app: '@okta/test.app.react-mfa-v1',
    spec: ['mfa.js'],
    flags: [MFA_ENABLED]
  },
];

const configPredicate = config => {
  // returns true when config.flags and envrionment variable flags can match
  const flags = [REFRESH_TOKEN, MFA_ENABLED, ORG_OIE_ENABLED];
  while (flags.length) {
    const flag = flags.pop();
    if (!process.env[flag] && config.flags.includes(flag)) {
      return false;
    }
    if (process.env[flag] && !config.flags.includes(flag)) {
      return false;
    }
  }
  return true;
};

module.exports = {
  config,
  configPredicate
};
