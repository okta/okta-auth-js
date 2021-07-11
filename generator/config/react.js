module.exports = [
  {
    pkgName: '@okta/samples.react.okta-hosted-login',
    type: 'github-sample',
    useSiw: false,
    excludeAction: /^doc-/
  },
  {
    pkgName: '@okta/samples.react.custom-login',
    type: 'github-sample',
    useSiw: true,
    excludeAction: /^doc-/
  },
  {
    pkgName: '@okta/samples.react.doc-signin-widget',
    type: 'doc-sample',
    useSiw: true,
    excludeAction: /^github-/
  },
  {
    pkgName: '@okta/samples.react.doc-no-oidc',
    type: 'doc-sample',
    useSiw: false,
    excludeAction: /^github-/
  }
];
