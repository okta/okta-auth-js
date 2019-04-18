# Changelog

## 2.5.0

### Features
- [d736cc9](https://github.com/okta/okta-auth-js/commit/d736cc9ad5377f4fecac2644390a9f856d5d8238) - New TokenManager option to support HTTPS-only "secure" cookies.

### Other
- [fddec0a](https://github.com/okta/okta-auth-js/commit/fddec0a21a060d3ed81246b2ca79faf8364f638f) - Use `fetch` as the default request agent (instead of `reqwest`).


## 2.3.1

### Bug Fixes

- [#187](https://github.com/okta/okta-auth-js/pull/187) - When deprecated `ajaxRequest` was passed to config, the logger for the deprecate message was still using window.console. This fix makes the logger isomorphic.

## 2.3.0

### Features

- [#184](https://github.com/okta/okta-auth-js/pull/184) - Adds support for calling the AuthN API from Node

## 2.2.0

### Bug Fixes

- [#178](https://github.com/okta/okta-auth-js/pull/178) - Resolves an issue introduced with [#171](https://github.com/okta/okta-auth-js/pull/171) causing the silent login flow to throw errors

## 2.1.0

### Bug Fixes

- [#172](https://github.com/okta/okta-auth-js/pull/172) - Fixes an issue where default storage was read-only
- [#161](https://github.com/okta/okta-auth-js/pull/161) - `ignoreSignature` was not set when redirecting

### Other

- [#171](https://github.com/okta/okta-auth-js/pull/171) - Scrub null/undefined values from authorize requests
- [#162](https://github.com/okta/okta-auth-js/pull/162) - Update dependencies

## 2.0.1

### Bug Fixes

* Fixed an problem, introduced in 2.0.0, that was causing tokens to be refreshed every time `authClient.tokenManager.get('accessToken')` was called.

## 2.0.0

### Breaking Changes

* Token retrieval is now asyncronous to account for automatic token renewal.

  ```javascript
  // ES2016+
  const accessToken = await authClient.tokenManager.get('accessToken');

  // Handle as a promise
  authClient.tokenManager.get('accessToken')
  .then(function(accessToken) {
    console.log(accessToken);
  });
  ```

* Removed the following deprecated methods:
  * `idToken.authorize`
  * `idToken.verify`
  * `idToken.refresh`
  * `idToken.decode`

### Features

* Clears whitespace around URLs when instantiating the client.
* Infer the `url` from the `issuer` to simplify client setup.

### Other

* Renames all `refresh` methods on the `token` and `tokenManager` objects to `renew`.
