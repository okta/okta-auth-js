module.exports = [
  {
    name: 'custom-login',
    dest: 'samples/react',
    type: 'github',
    header: 'PKCE Flow w/ Custom Login',
    filterPredicate: action => action !== 'doc-src'
  },
  {
    name: 'okta-hosted-login',
    dest: 'samples/react',
    type: 'github',
    header: 'PKCE Flow w/ Okta Hosted Login Page',
    filterPredicate: action => action !== 'doc-src'
  },
  {
    name: 'signin-widget',
    dest: 'samples/react',
    type: 'doc',
    filterPredicate: action => action !== 'github-src'
  },
  {
    name: 'auth-js-no-oidc',
    dest: 'samples/react',
    type: 'doc',
    filterPredicate: action => action !== 'github-src'
  }
];
