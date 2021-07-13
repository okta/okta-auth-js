module.exports = [
  {
    pkgName: '@okta/samples.react.okta-hosted-login',
    type: 'github-sample',
    useSiw: false,
    excludeAction: /^doc-/,
    features: [
      'okta-hosted-login/basic-auth'
    ]
  },
  {
    pkgName: '@okta/samples.react.custom-login',
    type: 'github-sample',
    useSiw: true,
    excludeAction: /^doc-/,
    features: [
      'custom-login/basic-auth'
    ]
  },
  {
    pkgName: '@okta/samples.react.doc-signin-widget',
    type: 'doc-sample',
    useSiw: true,
    excludeAction: /^github-/,
    features: [
      'doc-signin-widget/basic-auth'
    ]
  },
  {
    pkgName: '@okta/samples.react.doc-no-oidc',
    type: 'doc-sample',
    useSiw: false,
    excludeAction: /^github-/,
    features: [
      'doc-no-oidc/basic-auth'
    ]
  }
];
