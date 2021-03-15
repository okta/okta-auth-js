# Changelog

## 4.8.0

### Features

- [#652](https://github.com/okta/okta-auth-js/pull/652) Accepts 'state' as a constructor option

### Bug Fixes

- [#646](https://github.com/okta/okta-auth-js/pull/646) Fixes validate token using issuer from well-known config

### Other

- [#648](https://github.com/okta/okta-auth-js/pull/648) Updates widget to 5.4.2
- [#653](https://github.com/okta/okta-auth-js/pull/653) Removes isLoginRedirect check in oidc logic
- [#661](https://github.com/okta/okta-auth-js/pull/661) Upgrades node-cache to 5.1.2

## 4.7.2

### Bug Fixes

- [#638](https://github.com/okta/okta-auth-js/pull/638) Fixes an issue with revoking refresh tokens
- [#632](https://github.com/okta/okta-auth-js/pull/632) Fixes an issue with renewing refresh tokens
- [#616](https://github.com/okta/okta-auth-js/pull/616) Fixes issue with `fetch` on IE Edge versions 14-17.

## 4.7.1

### Bug Fixes

- [#627](https://github.com/okta/okta-auth-js/pull/627) Fixes an issue with Typescript and `StorageManagerOptions`

## 4.7.0

### Features

- [#620](https://github.com/okta/okta-auth-js/pull/620) Adds support for `interaction_code` and `error=interaction_required` on redirect callback
- [#604](https://github.com/okta/okta-auth-js/pull/604) Adds new utility objects: `storageManager` and `transactionManager`

### Bug Fixes

- [#614](https://github.com/okta/okta-auth-js/pull/614) Fixes issue with renewTokens and implicit flow: get responseType value from SDK configuration

### Other

- [#594](https://github.com/okta/okta-auth-js/pull/594) Adds `@babel/runtime` to dependencies list.
- [#572](https://github.com/okta/okta-auth-js/pull/572) Add idps options for Signin widget flow in samples
- [#565](https://github.com/okta/okta-auth-js/pull/565) Adds support for widget version and interaction code to test app and samples

## 4.6.2

### Bug Fixes

- [#616](https://github.com/okta/okta-auth-js/pull/616) Fixes issue with `fetch` on IE Edge versions 14-17.

## 4.6.1

- [#595](https://github.com/okta/okta-auth-js/pull/595) Ports fix for overeager `catch` when using refresh token originally from [#579](https://github.com/okta/okta-auth-js/pull/579)

## 4.6.0

### Features

- [#585](https://github.com/okta/okta-auth-js/pull/585) Uses native fetch, if available

### Other

- [#583](https://github.com/okta/okta-auth-js/pull/583) Better error handling for redirect flows: if redirect URI contains `error` or `error_description` then `isLoginRedirect` will return true and `parseFromUrl` will throw `OAuthError`

## 4.5.1

### Bug Fixes
- [#579](https://github.com/okta/okta-auth-js/pull/579) Removes overeager `catch` when using refresh token

## 4.5.0

### Features

- [#567](https://github.com/okta/okta-auth-js/pull/567) Adds new methods:
  - `token.prepareTokenParams`
  - `token.exchangeCodeForTokens`
  - `pkce.generateVerifier`
  - `pkce.computeChallenge`
  and constant:
  - `pkce.DEFAULT_CODE_CHALLENGE_METHOD`
  This API allows more control over the `PKCE` authorization flow and is enabled for both browser and nodeJS.

## 4.4.0

### Features

- [#554](https://github.com/okta/okta-auth-js/pull/554) Adds MFA types

## 4.3.0

### Features
- [#518](https://github.com/okta/okta-auth-js/pull/518) Added `claims` to `AccessToken`

## 4.2.0

### Features
- Adding the ability to use refresh tokens with single page applications (SPA) (Early Access feature - reach out to our support team)
  - `scopes` configuration option now handles 'offline_access' as an option, which will use refresh tokens IF your client app is configured to do so in the Okta settings
    - If you already have tokens (from a separate instance of auth-js or the okta-signin-widget) those tokens must already include a refresh token and have the 'offline_access' scope
    - 'offline_access' is not requested by default.  Anyone using the default `scopes` and wishing to add 'offline_access' should pass `scopes: ['openid', 'email', 'offline_access']` to their constructor
  - `renewTokens()` will now use an XHR call to replace tokens if the app has a refresh token.  This does not rely on "3rd party cookies"
    - The `autoRenew` option (defaults to `true`) already calls `renewTokens()` shortly before tokens expire.  The `autoRenew` feature will now automatically make use of the refresh token if present
  - `signOut()` now revokes the refresh token (if present) by default, which in turn will revoke all tokens minted with that refresh token
    - The revoke calls by `signOut()` follow the existing `revokeAccessToken` parameter - when `true` (the default) any refreshToken will be also be revoked, and when `false`, any tokens are not explicitly revoked.  This parameter name becomes slightly misleading (as it controls both access AND refresh token revocation) and will change in a future version.
   
## 4.1.2

### Bug Fixes

- [#541](https://github.com/okta/okta-auth-js/pull/541) Fixes type error in `VerifyRecoveryTokenOptions`

## 4.1.1

### Bug Fixes

- [#535](https://github.com/okta/okta-auth-js/pull/535) Respects `scopes` that are set in the constructor

## 4.1.0

### Features

- [#869](https://github.com/okta/okta-oidc-js/pull/869)
  - Implements `AuthStateManager` to evaluate and emit latest authState. Exposes new methods from `AuthStateManager`:
    - `authStateManager.getAuthState`
    - `authStateManager.updateAuthState`
    - `authStateManager.subscribe`
    - `authStateManager.unsubscribe`
  - Adds new methods in sdk browser scope:
    - `sdk.signInWithCredentials`
    - `sdk.signInWithRedirect`
    - `sdk.isAuthenticated`
    - `sdk.getUser`
    - `sdk.getIdToken`
    - `sdk.getAccessToken`
    - `sdk.storeTokensFromRedirect`
    - `sdk.setOriginalUri`
    - `sdk.getOriginalUri`
    - `sdk.removeOriginalUri`
    - `sdk.isLoginRedirect`
    - `sdk.handleLoginRedirect`
  - Deprecates method in sdk browser scope:
    - `sdk.signIn`
  - Adds new methods in `sdk.tokenManager`:
    - `tokenManager.getTokens`
    - `tokenManager.setTokens`
  - Accepts new [options](README.md#configuration-options)
    - `transformAuthState`
    - `restoreOriginalUri`
    - `autoRemove`
    - `devMode`
- [#469](https://github.com/okta/okta-auth-js/pull/469) Adds "rate limiting" logic to token autoRenew process to prevent too many requests be sent out which may cause application rate limit issue.
- [#503](https://github.com/okta/okta-auth-js/pull/503) Supports relative uri for [options.redirectUri](README.md#additional-options)
- [#478](https://github.com/okta/okta-auth-js/pull/478) Adds cross tabs communication to sync `AuthState`.
- [#525](https://github.com/okta/okta-auth-js/pull/525) Adds new methods `hasResponseType`, `isPKCE`, `isAuthorizationCodeFlow`. The option `responseType` is now accepted in the constructor.

### Bug Fixes

- [#468](https://github.com/okta/okta-auth-js/pull/468) Fixes issue where HTTP headers with an undefined value were being sent with the value "undefined". These headers are now removed before the request is sent.
- [#514](https://github.com/okta/okta-auth-js/pull/514) Fixes OAuth redirect params issue in legacy browsers.

## 4.0.3

### Bug Fixes

- [#468](https://github.com/okta/okta-auth-js/pull/468) Fixes issue where HTTP headers with an undefined value were being sent with the value "undefined". These headers are now removed before the request is sent.
- [#514](https://github.com/okta/okta-auth-js/pull/514) Fixes OAuth redirect params issue in legacy browsers.
- [#520](https://github.com/okta/okta-auth-js/pull/520) token.isLoginRedirect will check that current URL matches the redirectUri

## 4.0.2

- [#491](https://github.com/okta/okta-auth-js/pull/491) Fixes issue with OAuth param cookie when using self-hosted signin widget

- [#489](https://github.com/okta/okta-auth-js/pull/489) Fixes sameSite cookie setting when running on HTTP connection

## 4.0.1

### Bug Fixes

- [#473](https://github.com/okta/okta-auth-js/pull/473) Fixes login issue when cookies are blocked or used as shared state storage
  
## 4.0.0

### Features

- [#413](https://github.com/okta/okta-auth-js/pull/413) Adds support for Typescript. Uses named exports instead of default export.
- [#444](https://github.com/okta/okta-auth-js/pull/444) New method `tokenManager.hasExpired` to test if a token is expired

### Breaking Changes

- [#444](https://github.com/okta/okta-auth-js/pull/444)
  - Implements "active" autoRenew.  Previously tokens would be renewed or removed when calling `tokenManager.get`. Now they will be renewed or removed in the background. If autoRenew is true, tokens will be renewed before expiration. If autoRenew is false, tokens will be removed from storage on expiration.
  - `onSessionExpired` option has been removed. [TokenManager events](#tokenmanageronevent-callback-context) can be used to detect and handle token renewal errors.
  - `tokenManager.get` no longer implements autoRenew functionality (autoRenew is done by a separate process within `TokenManager`). Even with `autoRenew`, it is possible that the token returned from the TokenManager may be expired, since renewal is an asynchronous process. New method `tokenManager.hasExpired` can be used to test the token and avoid this potential race condition.

## 3.2.6

- [#522](https://github.com/okta/okta-auth-js/pull/522) Fixes `token.isLoginRedirect` issue with `code` query params in url
- [#517](https://github.com/okta/okta-auth-js/pull/517) Fixes OAuth redirect params issue in legacy browsers

## 3.2.5

- [#491](https://github.com/okta/okta-auth-js/pull/491) Fixes issue with OAuth param cookie when using self-hosted signin widget

- [#489](https://github.com/okta/okta-auth-js/pull/489) Fixes sameSite cookie setting when running on HTTP connection

## 3.2.4

### Bug Fixes

- [#473](https://github.com/okta/okta-auth-js/pull/473) Fixes login issue when cookies are blocked or used as shared state storage

## 3.2.3

### Bug Fixes

- [#440](https://github.com/okta/okta-auth-js/pull/440) Fixes signOut XHR fallback to reload page only if postLogoutRedirectUri matches the current URI
- [#445](https://github.com/okta/okta-auth-js/pull/445) Clears access token from storage after token revocation

## 3.2.2

### Bug Fixes

- [#422](https://github.com/okta/okta-auth-js/pull/422) Fixes revoke accessToken in signOut method
- [#441](https://github.com/okta/okta-auth-js/pull/441) Fixes issue involving an "invalid grant" error: "PKCE verification failed."

## 3.2.1

### Bug Fixes

- [#431](https://github.com/okta/okta-auth-js/pull/431) Skips non parsable iframe messages for `sdk.fingerprint`

## 3.2.0

### Features

-[#408](https://github.com/okta/okta-auth-js/pull/408) Provides a polyfill for IE 11+

-[#410](https://github.com/okta/okta-auth-js/pull/410) Add `token.isLoginRedirect` function to prevent app from starting new Oauth flow while already in OAuth callback state.

## 3.1.4

### Bug Fixes

- [#400](https://github.com/okta/okta-auth-js/pull/400) Allows an accessToken to be retrieved without an idToken. Also allows retrieving "default" scopes as defined by the custom authorization server.

- [#402](https://github.com/okta/okta-auth-js/pull/402) Fixes tokenManager cookie storage size limitation issue by store tokens in separated cookies.

## 3.1.3

### Bug Fixes

- [#395](https://github.com/okta/okta-auth-js/pull/395) Prevents concurrent use of token API methods such as `getWithoutPrompt`, `getWithRedirect` or `getWithPopup` within a single running instance. These methods will be executed within a queue to ensure that they complete sequentially. This fix only affects a single instance. If there are several instances running (for example, in multiple tabs) it is still possible for token API methods to be executing concurrently.

- [#399](https://github.com/okta/okta-auth-js/pull/399) Fixes an error involving PKCE flow and the signin widget.

## 3.1.2

- [#384](https://github.com/okta/okta-auth-js/pull/384) Shifts browser storage for ephemeral PKCE code challenge to default to sessionStorage before localStorage or cookies.
  - This should reduce problems with multiple tabs making overlapping requests to renew tokens.
- [#386](https://github.com/okta/okta-auth-js/pull/386) Fixes `token.verify`: `validationParams` should be optional.

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
