module.exports = [
  {
    pkgName: '@okta/samples.react.okta-hosted-login',
    name: 'okta-hosted-login',
    dest: 'samples/react/okta-hosted-login',
    type: 'github-sample',
    useSiw: false,
    header: 'PKCE Flow w/ Okta Hosted Login Page',
    filterPredicate: action => !action.startsWith('doc-')
  },
  {
    pkgName: '@okta/samples.react.custom-login',
    name: 'custom-login',
    dest: 'samples/react/custom-login',
    type: 'github-sample',
    useSiw: true,
    header: 'PKCE Flow w/ Custom Login',
    filterPredicate: action => !action.startsWith('doc-')
  },
  {
    pkgName: '@okta/samples.react.doc-signin-widget',
    dest: 'samples/react/doc-signin-widget',
    type: 'doc-sample',
    useSiw: true,
    filterPredicate: action => !action.startsWith('github-')
  },
  {
    pkgName: '@okta/samples.react.doc-no-oidc',
    dest: 'samples/react/doc-no-oidc',
    type: 'doc-sample',
    useSiw: false,
    filterPredicate: action => !action.startsWith('github-')
  }
];
