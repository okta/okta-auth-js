# Changelog

## 3.1.1

### Bug Fixes

- [#369](https://github.com/okta/okta-auth-js/pull/369)
  - Will reject with error if PKCE is enabled but not supported when OIDC flow is initiated. Previously this check was done in the constructor and affected non-OIDC flows

  - Will print a console warning and disable secure cookies if cookies.secure is enabled on an HTTP connection. Previously this would throw in the constructor.

## 3.1.0

### Features

- [#363](https://github.com/okta/okta-auth-js/pull/363) 
  - Expose server bundle for React Native platform as an Authentication SDK.
  - Handle userAgent customization with newly added userAgent field in config.

## 3.0.1

### Bug Fixes

- [#354](https://github.com/okta/okta-auth-js/pull/354) - Omit cookies from API requests. Removes warning messages in latest version of Chrome.

- [#355](https://github.com/okta/okta-auth-js/pull/355) - Fix for authorization_code flow for non-SPA applications (when responseType=code and pkce=false). The code can be retrieved client-side using `parseFromUrl()` without throwing an error.

## 3.0.0

### Features

New [option](README.md#additional-options) `cookies` allows overriding default `secure` and `sameSite` values.

### Breaking Changes

- [#308](https://github.com/okta/okta-auth-js/pull/308) - Removed `jquery` and `reqwest` httpRequesters

- [#309](https://github.com/okta/okta-auth-js/pull/309) - Removed `Q` library, now using standard Promise. IE11 will require a polyfill for the `Promise` object. Use of `Promise.prototype.finally` requires Node > 10.3 for server-side use.

- [#310](https://github.com/okta/okta-auth-js/pull/310) - New behavior for [signOut()](README.md#signout)
  - `postLogoutRedirectUri` will default to `window.location.origin`
  - [signOut()](README.md#signout) will revoke access token and perform redirect by default. Fallback to XHR [closeSession()](README.md#closesession) if no idToken.
  - New method [closeSession()](README.md#closesession) for XHR signout without redirect or reload.
  - New method [revokeAccessToken()](README.md#revokeaccesstokenaccesstoken)

- [#311](https://github.com/okta/okta-auth-js/pull/311) - [parseFromUrl()](README.md#tokenparsefromurloptions) now returns tokens in an object hash (instead of array). The `state` parameter (passed to authorize request) is also returned.

- [#313](https://github.com/okta/okta-auth-js/pull/313) - An HTTPS origin will be enforced unless running on `http://localhost` or `cookies.secure` is set to `false`

- [#316](https://github.com/okta/okta-auth-js/pull/316) - Option `issuer` is [required](README.md#configuration-reference). Option `url` has been deprecated and is no longer used.

- [#317](https://github.com/okta/okta-auth-js/pull/317) - `pkce` [option](README.md#additional-options)  is now `true` by default. `grantType` option is removed.

- [#320](https://github.com/okta/okta-auth-js/pull/320) - `getWithRedirect`, `getWithPopup`, and `getWithoutPrompt` previously took 2 sets of option objects as parameters, a set of "oauthOptions" and additional options. These methods now take a single options object which can hold all [available options](README.md#authorize-options). Passing a second options object will cause an exception to be thrown.

- [#321](https://github.com/okta/okta-auth-js/pull/321)
  - Default responseType when using [implicit flow](README.md#implicit-oauth-20-flow) is now `['token', 'id_token']`.
  - When both access token and id token are returned, the id token's `at_hash` claim will be validated against the access token

- [#325](https://github.com/okta/okta-auth-js/pull/325) - Previously, the default `responseMode` for [PKCE](README.md#pkce-oauth-20-flow) was `"fragment"`. It is now `"query"`. Unless explicitly specified using the `responseMode` option, the `response_mode` parameter is no longer passed by `token.getWithRedirect` to the `/authorize` endpoint. The `response_mode` will be set by the backend according to the [OpenID specification](https://openid.net/specs/openid-connect-core-1_0.html#Authentication). [Implicit flow](README.md#implicit-oauth-20-flow) will use `"fragment"` and [PKCE](README.md#pkce-oauth-20-flow) will use `"query"`. If previous behavior is desired, [PKCE](README.md#pkce-oauth-20-flow) can set the `responseMode` option to `"fragment"`.

- [#329](https://github.com/okta/okta-auth-js/pull/329) - Fix internal fetch implementation. `responseText` will always be a string, regardless of headers or response type. If a JSON object was returned, the object will be returned as `responseJSON` and `responseType` will be set to "json". Invalid/malformed JSON server response will no longer throw a raw TypeError but will return a well structured error response which includes the `status` code returned from the server.

### Other

- [#306](https://github.com/okta/okta-auth-js/pull/306) - Now using babel for ES5 compatibility. [All polyfills have been removed](README.md#browser-compatibility).

- [#312](https://github.com/okta/okta-auth-js/pull/312) - Added an E2E test for server-side authentication (node module, not webpack).

## 2.13.2

### Bug Fixes

-[#338](https://github.com/okta/okta-auth-js/pull/338) - (Fix for Chrome 80) Setting 'Secure' on cookies if running on HTTPS. Setting 'SameSite=Lax' on cookies if running on HTTP. TokenManager (if using cookie storage) will retain previous behavior, setting 'SameSite=Lax' in all cases unless `tokenManager.secure` is set to `true` via config.

## 2.13.1

### Bug Fixes

- [#334](https://github.com/okta/okta-auth-js/pull/334) - Setting 'SameSite=none' for all cookies (Fix for iFrame)

## 2.13.0

### Features

- [#324](https://github.com/okta/okta-auth-js/pull/324) - Support `responseMode: "query"` option for SPA apps using PKCE flow

## 2.12.1

### Bug Fixes

- [#315](https://github.com/okta/okta-auth-js/pull/315)`getWellKnown` was using base url over issuer. Method has been fixed to use issuer, if configured, and will fallback to base url
- [#319](https://github.com/okta/okta-auth-js/pull/319) - Setting 'SameSite=lax' for all cookies (Fix for Firefox/Safari)

## 2.12.0

### Features

- [#304](https://github.com/okta/okta-auth-js/pull/304) - Will set a 'SameSite' value on all cookies set by this SDK
  - Cookies intended for server-side use will be set to 'Lax', cookies intended for client-side use will be set to 'Strict'

## 2.11.2

### Features

- [#271](https://github.com/okta/okta-auth-js/pull/271) - New option `onSessionExpired`

## 2.11.1

### Other

- [#293](https://github.com/okta/okta-auth-js/pull/293) - Copy markdown files to package directory during publish

## 2.11.0

### Features

- [#288](https://github.com/okta/okta-auth-js/pull/288) - New options for `signOut`:
  - Can provide a post-logout redirect URI.
  - Can revoke access token

### Bug Fixes

- [#288](https://github.com/okta/okta-auth-js/pull/288) - calling `signOut` will clear the TokenManager.
- [#284](https://github.com/okta/okta-auth-js/pull/284) - `isPKCESupported` will return false if `TextEncoder` is not available (IE Edge).

### Other

- [#284](https://github.com/okta/okta-auth-js/pull/284) - better error messages when attempting to use PKCE in an unsupported browser configuration.

## 2.10.1

### Other

- Fixes incorrect npm publish of previous version

## 2.10.0

### Features
- [#266](https://github.com/okta/okta-auth-js/pull/266) - New storage options for TokenManager

### Bug Fixes
- [#265](https://github.com/okta/okta-auth-js/pull/265) - Fix for popup blockers

### Other

- [#256](https://github.com/okta/okta-auth-js/pull/256) - Adds E2E tests, updates test app
- [#249](https://github.com/okta/okta-auth-js/pull/249) - Convert to yarn workspace
- [#264](https://github.com/okta/okta-auth-js/pull/264) - Removed lib/config.js, replaced with lib/constants.js and webpack define

## 2.9.0

### Features
- [add5369](https://github.com/okta/okta-auth-js/pull/252/commits/add536984b07538a7830b2f3e50c64abf2cd2ccf) Add support to pass callback to poll function

### Bug Fixes
- [541683](https://github.com/okta/okta-auth-js/pull/246/commits/541683227d3e10865da0bcb543e16f5202879ad0) Origin mismatch will now cause promise rejection (token renew)
- [d9900a](https://github.com/okta/okta-auth-js/pull/246/commits/d9900a7bf9da5c6d8d97e1bcce6647ed0e418fbb) TokenManager: return existing promise for concurrent requests
- [77ece4](https://github.com/okta/okta-auth-js/pull/247/commits/77ece4c05657bf3e695c25c1ab568e82da48fbca) Clear token on 'AuthSdkError'

## 2.7.0
### Features
- [(#238)](https://github.com/okta/okta-auth-js/pull/238) - Adds pass-thru of optional 'loginHint' and 'idpScopes' params (resolves [issue #214](https://github.com/okta/okta-auth-js/issues/214))

## 2.6.3

### Other
- [(#235)](https://github.com/okta/okta-auth-js/pull/235) - Option `grantType` has been deprecated and will be removed in 3.0

## 2.6.2

### Features
- [(#233)](https://github.com/okta/okta-auth-js/pull/235) - New option `pkce` 

### Bug Fixes
- [(#233)](https://github.com/okta/okta-auth-js/pull/233)  The default `responseMode` was incorrectly set to `fragment` instead of `query` when the `responseType` was `code`. This regression was introduced in version `2.6.0`.

- [747216b](https://github.com/okta/okta-auth-js/commit/747216ba2d186d17a08b0f0482da7e3e94977e98) fix build process, so that /dist/okta-auth-js.min.js is for browsers (since version 2.2.0, dist/ output was being built for node.js applications, which was not intended)

## 2.6.1

### Features
- [d8d2fee](https://github.com/okta/okta-auth-js/commit/d8d2feee6832fde7c297fd63f58e738c478d338b) TokenManager: new option `expireEarlySeconds`

### Bug Fixes
- TokenManager: Re-enables use of custom storage keys

### Other
- TokenManager: Document the `maxClockSkew` option

## 2.6.0

### Features
- [0a8a4e1](https://github.com/okta/okta-auth-js/commit/0a8a4e16d75028900280ab93e561d9e4368a484f) PKCE support

### Bug Fixes
- TokenManager: tokens were being expired 5 minutes early

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
