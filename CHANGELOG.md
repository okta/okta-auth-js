# Changelog

## 7.3.0

### Features

- [#1404](https://github.com/okta/okta-auth-js/pull/1404) Adds `react-native` to `package.json`
- [#1395](https://github.com/okta/okta-auth-js/pull/1395) Changes resolve value of `closeSession()` and `signOut()` to boolean

### Fixes

- [#1398](https://github.com/okta/okta-auth-js/pull/1398) Fixes race condition in `LeaderElectionService` start

## 7.2.0

### Features

- [#1333](https://github.com/okta/okta-auth-js/pull/1333) Adds support for MyAccount API password methods
- [#1324](https://github.com/okta/okta-auth-js/pull/1324) Adds `endpoints.authorize.enrollAuthenticator`. Adds `handleRedirect` and deprecates `handleLoginRedirect`.

### Fixes

- [#1354](https://github.com/okta/okta-auth-js/pull/1354) Fixes token auto renew if token has expired before `AutoRenewService` start
- [#1359](https://github.com/okta/okta-auth-js/pull/1359) IDX: removes statehandle check when load saved idxResponse

## 7.1.1

### Fixes

- [#1355](https://github.com/okta/okta-auth-js/pull/1355) Adds missing type `currentAuthenticatorEnrollment` to `IdxContext`

## 7.1.0

### Features

- [#1343](https://github.com/okta/okta-auth-js/pull/1343) Supports Step Up MFA against `/authorize` and `/interact` endpoints

# Other

- [#1342](https://github.com/okta/okta-auth-js/pull/1342) - fixes possible RCE in jsonpath-plus

## 7.0.2

### Fixes

- [#1335](https://github.com/okta/okta-auth-js/pull/1335) IDX: adds `uiDisplay` property to `IdxContext` type
- [#1336](https://github.com/okta/okta-auth-js/pull/1319) IDX: adds `deviceKnown` property to `IdxAuthenticator` type
- [#1337](https://github.com/okta/okta-auth-js/pull/1337) IDX: fixes account activation flow by removing check for `identify` remediation

## 7.0.1

### Fixes

- [#1319](https://github.com/okta/okta-auth-js/pull/1319) IDX: fixes cancel request issue in terminal status

## 7.0.0

### Breaking Changes

- [#1181](https://github.com/okta/okta-auth-js/pull/1181) Removes legacy PKCE/OAuth storage
- [#1271](https://github.com/okta/okta-auth-js/pull/1271) Removes `options` field from `NextStep` of IDX transaction
- [#1274](https://github.com/okta/okta-auth-js/pull/1274) Removes shouldProceedWithEmailAuthenticator option from idx module

## 6.9

- [#1307](https://github.com/okta/okta-auth-js/pull/1307) Adds `nonce` param to `idx.interact` (and `idx.start`) 

## 6.8.1

### Fixes

- [#1305](https://github.com/okta/okta-auth-js/pull/1305) Bumps version of `broadcast-channel` to 4.17, removing `microtime` sub dependency

## 6.8.0

### Other

- [#1243](https://github.com/okta/okta-auth-js/pull/1243) Adds export of `./polyfill` in package.json
- [#1276](https://github.com/okta/okta-auth-js/pull/1276) Support custom URL scheme in `isAbsoluteUrl`

## 6.7.7

- [#1292](https://github.com/okta/okta-auth-js/pull/1292) Fixes browser default entry issue from [#1269](https://github.com/okta/okta-auth-js/pull/1269)
- [#1286](https://github.com/okta/okta-auth-js/pull/1286) Fixes embedded browser regression issue when localStorage is disabled
## 6.7.6

### Fixes

- [#1277](https://github.com/okta/okta-auth-js/pull/1277) IDX GenericRemediator patches (beta):
  - fixes error handling issue

## 6.7.5

### Fixes
- [#1269](https://github.com/okta/okta-auth-js/pull/1269) Fixes ESM exports
  - Adds `default` export under `./browser` to support `Jest@28.1+`
  - Adds work-around for webpack/webpack#13457 to support Module Federation (with ESM bundles)

## 6.7.4

### Fixes
- [#1263](https://github.com/okta/okta-auth-js/pull/1263) (IDX) `select-enrollment-channel` remediation now accepts protocol defined inputs, as well as conveniences
- [#1262](https://github.com/okta/okta-auth-js/pull/1262) Freezes `broadcast-channel` version at `4.13.0`, `4.14.0` requires node 14+ (This fix has been applied to 6.5.4 and up)

## 6.7.3

- [#1264](https://github.com/okta/okta-auth-js/pull/1264) IDX GenericRemediator patches (beta):
  - allows proceeding when `options.step` is available

## 6.7.2

### Fixes

- [#1251](https://github.com/okta/okta-auth-js/pull/1251) IDX GenericRemediator patches (beta):
  - allows flow entry point requests

## 6.7.1

### Fixes

- [#1245](https://github.com/okta/okta-auth-js/pull/1245) IDX GenericRemediator patches (beta):
  - disables client side validation
  - fixes ion response primitive types transformation issue
  - adds missing types to `IdxAuthenticator`
  - adds missing action meta to `IdxTransaction.availableSteps`

- [#1247](https://github.com/okta/okta-auth-js/pull/1247) - Fixes OV enrollment flow issue in authentication flow.

## 6.7.0

### Features

- [#1197](https://github.com/okta/okta-auth-js/pull/1197)
  - Changes implementation of `SyncStorageService` using `broadcast-channel` instead of using `StorageEvent`. Supports `localStorage` and `cookie` storage.
  - Adds `LeaderElectionService` as separate service
  - Fixes error `Channel is closed` while stopping leader election
- [#1158](https://github.com/okta/okta-auth-js/pull/1158) Adds MyAccount API. See [MyAccount API DOC](/docs/myaccount/README.md) for detailed information.

## 6.6.3

- [#1282](https://github.com/okta/okta-auth-js/pull/1282) Backport 6.5.4, includes microtime fix [#1280](https://github.com/okta/okta-auth-js/pull/1280)

## 6.6.2

### Fixes

- [#1231](https://github.com/okta/okta-auth-js/pull/1231) IDX: exposes field level error messages
- [#1234](https://github.com/okta/okta-auth-js/pull/1234) IDX: passes unknown selected option to backend for validation when use GenericRemediator (beta)

## 6.6.1

### Fixes

- [#1221](https://github.com/okta/okta-auth-js/pull/1221) Fixes ES module for Node.js by using latest `broadcast-channel`

## 6.6.0

### Features

- [#1225](https://github.com/okta/okta-auth-js/pull/1225) `oktaAuth.start`/`oktaAuth.stop` now return a `Promise`, ensures services have started/stopped before resolving

### Fixes

- [#1226](https://github.com/okta/okta-auth-js/pull/1226) Fixes idx terminal status response SDK level `undefined` error when use GenericRemediator (beta)
- [#1222](https://github.com/okta/okta-auth-js/pull/1222) Invalid (or expired) refresh tokens are now removed from storage when invalid token error occurs

## 6.5.4

- [#1280](https://github.com/okta/okta-auth-js/pull/1280) Locks version of `broadcast-channel` at `4.13.0` to prevent node minimum version regressions

## 6.5.3

- [#1224](https://github.com/okta/okta-auth-js/pull/1224) Fixes missing `relatesTo` type from `NextStep`

## 6.5.2

### Fixes

- [#1215](https://github.com/okta/okta-auth-js/pull/1215) Fixes polling issue in GenericRemediator (beta)

## 6.5.1

### Fixes

- [#1200](https://github.com/okta/okta-auth-js/pull/1200) Fixes `canRemediate` logic in GenericRemediator (beta) to handle nested fields
- [1207](https://github.com/okta/okta-auth-js/pull/1207) Fixes `canRemediate` logic in GenericRemediator (beta) to handle `options` fields

### Other

- [#1200](https://github.com/okta/okta-auth-js/pull/1200) Adds missing fields to `Input` type in `idx` module

## 6.5.0

### Features

- [#1186](https://github.com/okta/okta-auth-js/pull/1186) Supports `maxAge` param in interaction code flow. This parameter can be passed in from either SDK level options or `idx.interact` options.
- [#1189](https://github.com/okta/okta-auth-js/pull/1189) IDX: includes `options` field in `inputs` scope, and deprecated top level `options` from `nextStep` field of the response (removal will happen in the next major version).

### Fixes

- [#1189](https://github.com/okta/okta-auth-js/pull/1189) IDX: fixes `input` type indicator's field name for `username` and `authenticator`. Before the indicator was named as `key`, now it's fixed to `type` to follow input metadata with all other inputs.
## 6.4.5

### Fixes

- [#1240](https://github.com/okta/okta-auth-js/pull/1204) Fixes Apple SSO flow: includes `stepUp` on returned `IdxTransaction`

## 6.4.4

### Fixes

- [#1199](https://github.com/okta/okta-auth-js/pull/1199) Fixes webauthn enrollment/verification to accept `credentials` object

## 6.4.3

### Fixes

- [#1182](https://github.com/okta/okta-auth-js/pull/1182) Fixes security question verification to accept `credentials.answer`
- [#1184](https://github.com/okta/okta-auth-js/pull/1184) Fixes type declarations: `ApiError`, `responseType`, `responseMode`
- [#1185](https://github.com/okta/okta-auth-js/pull/1185) Fixes "cancel" and "skip" action called after receiving a terminal or error response

## 6.4.2

### Fixes

- [#1180](https://github.com/okta/okta-auth-js/pull/1180) Fixes commonjs bundle `dynamic import` transpiling issue

## 6.4.1

### Fixes

[#1177](https://github.com/okta/okta-auth-js/pull/1177) - fixes issue with repeated calls to `oktaAuth.start()`

## 6.4

### Features

- [#1161](https://github.com/okta/okta-auth-js/pull/1161)
  - IDX actions accept optional/additional parameters
  - `requestDidSucceed` is returned on `IdxTransaction`
  - adds IDX option `shouldProceedWithEmailAuthenticator` to disable email authenticator auto-selection

### Fixes

- [#1145](https://github.com/okta/okta-auth-js/pull/1145)
  - IDX: form field-level messages are now passed through via idxState
  - Type Fixes:
    - IdxContent: `user` property now optional
    - Input: added missing `key` property

- [#1161](https://github.com/okta/okta-auth-js/pull/1161)
  - fixes for stateToken flow

### Other

- [#1145](https://github.com/okta/okta-auth-js/pull/1145)
  - refactor: IDX methods now use auth-js http client
  - refactor: idx-js methods have been refactored to idxState

## 6.3.2

### Fixes

- [#1169](https://github.com/okta/okta-auth-js/pull/1169) Removes deleted file which was inadvertently added back in a merge

## 6.3.1

### Fixes

- [#1160](https://github.com/okta/okta-auth-js/pull/1160)
  - Fixes error handling for IDX actions
  - Fixes saved IDX transaction

## 6.3.0

### Features

- [#1090](https://github.com/okta/okta-auth-js/pull/1090)
  - An `authenticator` can be provided to IDX methods as either a string (representing the authenticator key) or an authenticator object
  - IDX functions will accept the "canonical" name for inputs (as defined by server response). For example a `credentials` object can be passed to satisfy an "identify" remediation instead of `username` and `password`
  - `idx.proceed` will continue without saved transaction meta if a `stateHandle` is available
  - Unknown remediations/values will proceed if the proper data is supplied by the caller
  - IDX response object has a new field `requestDidSucceed` which will be false if the XHR was returned with a non-2xx HTTP status

### Fixes

- [#1090](https://github.com/okta/okta-auth-js/pull/1090)
  - Fixes concurrency issue with `transformAuthState`. Concurrent auth state updates will now enqueue calls to `transformAuthState` so that they execute sequentially
  - Fixes issue with in-memory storage provider, where storage was shared between AuthJS instances in the same page/process. In-memory storage will now be unique per AuthJS instance.
  - Fixes issue with the `step` option in IDX flows: it will only be used for a single remediation cycle
- [#1136](https://github.com/okta/okta-auth-js/pull/1136) Fixes typo in security question enrollment

### Other

- [#1090](https://github.com/okta/okta-auth-js/pull/1090) Removes runtime regenerator for development builds

## 6.2.0

### Features

- [#1113](https://github.com/okta/okta-auth-js/pull/1113) Updates types for `SigninWithCredentialsOptions` and `SignInOptions` to support `SP Initiated Auth`
- [#1125](https://github.com/okta/okta-auth-js/pull/1125) IDX - Supports auto select methodType (when only one selection is available) for `authenticator-verification-data` remediation
- [#1114](https://github.com/okta/okta-auth-js/pull/1114) Exposes ESM node bundle

### Fixes

- [#1114](https://github.com/okta/okta-auth-js/pull/1114) Fixes ESM browser bundle issue by only using ESM `import` syntax

### Fixes

- [#1130](https://github.com/okta/okta-auth-js/pull/1130) `state` now stored in session during verifyEmail flow

### Other

- [#1124](https://github.com/okta/okta-auth-js/pull/1124)
  - Adds multi-tab "leadership" election to prevent all tabs from renewing tokens at the same time
  - Adds granular configurations for `autoRenew` (active vs passive)
  - Adds options to `isAuthenticated` to override client configuration
  - Fixes issue in token renew logic within `isAuthenticated`, tokens are now read from `tokenManager` (not memory) before expiration is checked

## 6.1.0

### Features

- [#1036](https://github.com/okta/okta-auth-js/pull/1036) Adds `webauthn` authenticator support in idx module
- [#1075](https://github.com/okta/okta-auth-js/pull/1075) Adds top level `invokeApiMethod` method as an escape hatch to make arbitrary OKTA API request
- [#1093](https://github.com/okta/okta-auth-js/pull/1093) Allows passing device context headers (`X-Forwarded-For`, `User-Agent`, `X-Okta-User-Agent-Extended` and `X-Device-Token`) to `idx.interact`. Follow [setHeaders](README.md#setheaders) section to add headers to http requests.

### Fixes

- [#1071](https://github.com/okta/okta-auth-js/pull/1071) TypeScript: Adds fields for `Input` type in NextStep object
- [#1094](https://github.com/okta/okta-auth-js/pull/1094) TypeScript: Fixes `SigninOptions.context` type
- [#1092](https://github.com/okta/okta-auth-js/pull/1092) Call `updateAuthState` when `handleLoginRedirect` fails

### Other

- [#1073](https://github.com/okta/okta-auth-js/pull/1103) Upgrades `cross-fetch` to resolve security vulnerability

## 6.0.0

### Breaking Changes

- [#1003](https://github.com/okta/okta-auth-js/pull/1003) Supports generic UserClaims type. Custom claims should be extended by typescript generics, like `UserClaims<{ groups: string[]; }>`
- [#1050](https://github.com/okta/okta-auth-js/pull/1050) Removes `userAgent` field from oktaAuth instance
- [#1014](https://github.com/okta/okta-auth-js/pull/1014) Shared transaction storage is automatically cleared on success and error states. Storage is not cleared for "terminal" state which is neither success nor error.
- [#1051](https://github.com/okta/okta-auth-js/pull/1051) Removes `useMultipleCookies` from CookieStorage options
- [#1059](https://github.com/okta/okta-auth-js/pull/1059)
  - Removes signOut option `clearTokensAfterRedirect`
  - Adds signOut option `clearTokensBeforeRedirect` (default: `false`) to remove local tokens before logout redirect happen
- [#1057](https://github.com/okta/okta-auth-js/pull/1057) Strict checks are now enabled in the Typescript compiler options. Some type signatures have been changed to match current behavior.
- [#1062](https://github.com/okta/okta-auth-js/pull/1062)
  - Authn method `introspect` is renamed to `introspectAuthn` (still callable as `tx.introspect`)
  - `IdxFeature` enum is now defined as strings instead of numbers

### Features

- [#1014](https://github.com/okta/okta-auth-js/pull/1014) Updates IDX API to support email verify and recovery/activation
  - adds new configuration options `recoveryToken` and `activationToken`
  - email verify callback:
    - adds support for passing `otp` to idx pipeline
    - updates samples to display error message with OTP code
  - idx methods support new options:
    - `exchangeCodeForTokens`. If false, `interactionCode` will be returned on the transaction at the end of the flow instead of `tokens`.
    - `autoRemediate`. If false, there will be no attempt to satisfy remediations even if values have been passed.
  - TransactionManager supports new option:
    - `saveLastResponse`. If false, IDX responses will not be cached.
- [#1062](https://github.com/okta/okta-auth-js/pull/1062)
  - All IDX methods are exported.
  - `useInteractionCodeFlow` defaults to `true` for sample and test apps.

## 5.11.0

- [#1064](https://github.com/okta/okta-auth-js/pull/1064) Supports skip authenticator in idx authentication flow

## 5.10.1

### Fixes

- [#1054](https://github.com/okta/okta-auth-js/pull/1054) Fixes Typescript build error

## 5.10.0

### Features

- [#1010](https://github.com/okta/okta-auth-js/pull/1010) Supports `clearPendingRemoveTokens` option in `signOut` method. This option can be used to avoid cross tabs sign out issue with Okta's downstream client SDK's `SecureRoute` component
- [#1035](https://github.com/okta/okta-auth-js/pull/1035) Adds `security question` authenticator support in idx module

### Fixes

- [#1028](https://github.com/okta/okta-auth-js/pull/1028) Any error caught in `token.renew()` will be emitted and contain `tokenKey` property
- [#1027](https://github.com/okta/okta-auth-js/pull/1027) Don't reject `isAuthenticated()` because of failed token renewal
- [#1032](https://github.com/okta/okta-auth-js/pull/1032) Fixes idx recover password flow with identifier first org policy
- [#1048](https://github.com/okta/okta-auth-js/pull/1048) Points browser field to UMD bundle 

## 5.9.1

### Other

- [#1021](https://github.com/okta/okta-auth-js/pull/1021) Removes `type` field in package.json. As okta-auth-js includes multiple bundles (cjs, esm, umd) in the package, explicit `type` field causes error for some type of bundlers. This change fixes [issue](https://github.com/okta/okta-auth-js/issues/1017) with @angular/cli.

## 5.9.0

### Features

- [#1004](https://github.com/okta/okta-auth-js/pull/1004) Allows extra query parameters to be added to the `authorize` url

### Other

- [#1000](https://github.com/okta/okta-auth-js/pull/1000)
  - Fixes broken ES module bundle
  - Updates `browser` field in `package.json` to enable bundlers to use the ES module bundle by default

### Fixes

- [#1005](https://github.com/okta/okta-auth-js/pull/1005)
  - Handles `rememberMe` boolean in IDX Identify remediation adapter
  - Typescript: Adds `type` field for `Input` type in NextStep object
- [#1012](https://github.com/okta/okta-auth-js/pull/1012) Fixes null access when crypto is not present

## 5.8.0

### Features

- [#990](https://github.com/okta/okta-auth-js/pull/990) Supports email verify callback

## 5.7.0

### Features

- [#983](https://github.com/okta/okta-auth-js/pull/983) Adds new method `setHeaders`
- [#990](https://github.com/okta/okta-auth-js/pull/990) Supports email verify callback

### Fixes

- [#988](https://github.com/okta/okta-auth-js/pull/988) Fixes Safari & Firefox browsers block `getWithPopup` issue
- [#995](https://github.com/okta/okta-auth-js/pull/995) Sends cookie for `authn` related requests
- [#985](https://github.com/okta/okta-auth-js/pull/985) Fixes issue with renewTokens that would drop scopes passed to `getToken`

### Other

- [#981](https://github.com/okta/okta-auth-js/pull/981) TypeScript: Allows optional paramters for IDX methods
- [#986](https://github.com/okta/okta-auth-js/pull/986) TypeScript: Interface `SignInWithRedirectOptions` should extend `TokenParams`
- [#992](https://github.com/okta/okta-auth-js/pull/992) TypeScript: Adds fields for `Input` type in NextStep object
- [#997](https://github.com/okta/okta-auth-js/pull/997) Validates `scopes` config param is an `array`

## 5.6.0

### Features

- [#963](https://github.com/okta/okta-auth-js/pull/963)
  - Adds `getPreviousAuthState` method to `AuthStateManager`
  - Allows null type for authState related methods / fields
- [#948](https://github.com/okta/okta-auth-js/pull/948) Adds `Google Authenticator` support in idx module

### Other

- [#947](https://github.com/okta/okta-auth-js/pull/947) TypeScript: Allow custom keys in `AuthState` interface

### Bug Fixes

- [#967](https://github.com/okta/okta-auth-js/pull/967) Throw error in `parseFromUrl` if can't load transaction meta

## 5.5.0

### Features

- [#933](https://github.com/okta/okta-auth-js/pull/933) Adds `ignoreLifetime` option to disable token lifetime validation
- [#932](https://github.com/okta/okta-auth-js/pull/932) Adds `headers` with response headers to all responses

### Bug Fixes

- [#936](https://github.com/okta/okta-auth-js/pull/936) Fixes getting mutiple memory storages issue in browser environment


## 5.4.3

### Bug Fixes

- [#926](https://github.com/okta/okta-auth-js/pull/926) Fixes incorrect using of `tokenManager` config (options `autoRenew`, `autoRemove`) in `OktaAuth.isAuthenticated`.
- [#931](https://github.com/okta/okta-auth-js/pull/931) Fixes types compatibility issue with old typescript versions (< 3.8)
- [#930](https://github.com/okta/okta-auth-js/pull/930) Fixes incorrect error message in idx `AuthTransaction` when user is not assigned.

## 5.4.2

### Bug Fixes

- [#927](https://github.com/okta/okta-auth-js/pull/927) Not trigger `authStateManager.updateAuthState` during login redirect in `start` method.

## 5.4.1

- [#916](https://github.com/okta/okta-auth-js/pull/916) Removes misleading warning message for TokenManager methods

## 5.4.0

### Features

- [#908](https://github.com/okta/okta-auth-js/pull/908) Enables dynamic attributes for profile enrollment
- [#906](https://github.com/okta/okta-auth-js/pull/906)
  - Checks idToken integrity during token auto renew process
  - Enables emitting `renewed` event for `TokenManager.setTokens` method
  - Exposes `crypto` util module

## 5.3.1

### Bug Fixes

- [#893](https://github.com/okta/okta-auth-js/pull/893) Fixes MFA keep returning `MFA_REQUIRED` status

## 5.3.0

### Features

- [#891](https://github.com/okta/okta-auth-js/pull/891) Adds new method `http.setRequestHeader`

### Bug Fixes

- [#852](https://github.com/okta/okta-auth-js/pull/852) Skips non-successful requests cacheing
- [#883](https://github.com/okta/okta-auth-js/pull/883) Resolves `state` from `token.parseFromUrl`

### Other

- [#853](https://github.com/okta/okta-auth-js/pull/853) Updates `token.parseFromUrl` signature (adds optional parameter)

## 5.2.3

### Bug Fixes

- [#873](https://github.com/okta/okta-auth-js/pull/873) Fixes AuthStateManager emitting inconsistence `isAuthenticated` state during active token auto renew by only checking existence of both tokens from storage

## 5.2.2

- [#862](https://github.com/okta/okta-auth-js/pull/862) Fixes issue with untranspiled `class` keyword
- [#858](https://github.com/okta/okta-auth-js/pull/858) Fixes issue with verifying tokens when using a proxied issuer

## 5.2.1

- [#845](https://github.com/okta/okta-auth-js/pull/845) Fixes issue with renewing using refresh tokens

## 5.2.0

### Features

- [#831](https://github.com/okta/okta-auth-js/pull/831) Calculates ID token expiry time based on local clock
- [#832](https://github.com/okta/okta-auth-js/pull/832) Supports rotating refresh tokens
- [#838](https://github.com/okta/okta-auth-js/pull/838) `idx.recoverPassword` - checks if flow is supported

### Bug Fixes

- [#832](https://github.com/okta/okta-auth-js/pull/832) Fixes issues with refresh tokens
- [#839](https://github.com/okta/okta-auth-js/pull/839) Fixes `@okta/okta-idx-js` missing core-js dependency.
- [#844](https://github.com/okta/okta-auth-js/pull/844) Fixes ES module includes `SDK_VERSION` placeholder issue

### Other

- [#839](https://github.com/okta/okta-auth-js/pull/839)
  - Moves `tsd` from dependencies to devDependencies
  - Reduces bundles size by upgrading `@okta/okta-idx-js` to 0.18.0 (replaced `jsonpath` with `jsonpath-plus`)
  - Reduces bundles size by removing unnecessary license banner

## 5.1.1

### Bug Fixes

- [#808](https://github.com/okta/okta-auth-js/pull/808) Fixes CommonJS bundle missing crypto modules issue

## 5.1.0

### Features

- [#730](https://github.com/okta/okta-auth-js/pull/730) `updateAuthState` returns a Promise.
- Adds `idx` module. See details in [IDX README.md](./docs/idx.md)

## 5.0.3

### Bug Fixes

- [#807](https://github.com/okta/okta-auth-js/pull/808) Fixes CommonJS bundle missing crypto modules issue

## 5.0.2

### Bug Fixes

- [#742](https://github.com/okta/okta-auth-js/pull/742) Fixes an issue where storage was being incorrectly cleared after an IDP redirect

## 5.0.1

### Bug Fixes

- [#731](https://github.com/okta/okta-auth-js/pull/731) Fixes issue with `handleLoginRedirect` where a redirect could occur after an exception was thrown.

## 4.9.2

### Bug Fixes

- [#742](https://github.com/okta/okta-auth-js/pull/742) Fixes an issue where storage was being incorrectly cleared after an IDP redirect

## 4.9.1

### Bug Fixes

- [#731](https://github.com/okta/okta-auth-js/pull/731) Fixes issue with `handleLoginRedirect` where a redirect could occur after an exception was thrown.
  
## 5.0.0

### Features

- [#694](https://github.com/okta/okta-auth-js/pull/694) Adds `cookies.sessionCookie` option

### Breaking Changes

- [#689](https://github.com/okta/okta-auth-js/pull/689) New methods `start` and `stop` are added to control `OktaAuth` as a service.
- [#515](https://github.com/okta/okta-auth-js/pull/515) Removes `token.value` field
- [#540](https://github.com/okta/okta-auth-js/pull/540) Locks `tokenManager.expireEarlySeconds` option with the default value (30s) for non-dev environment
- [#677](https://github.com/okta/okta-auth-js/pull/677) Http requests will not send cookies by default
- [#678](https://github.com/okta/okta-auth-js/pull/678) Default value for `originalUri` is null.
- [#706](https://github.com/okta/okta-auth-js/pull/706) Removes `isPending` from `AuthState`

### Other

- [#675](https://github.com/okta/okta-auth-js/pull/675) Removes warning when calling `updateAuthState` when there are no subscribers
- [#706](https://github.com/okta/okta-auth-js/pull/706) calling `isAuthenticated` will renew expired tokens when `autoRenew` is true

## 4.9.0

### Bug Fixes

- [#656](https://github.com/okta/okta-auth-js/pull/656) Fixes `TokenManager.renew` to renew only requested token

### Features

- [#656](https://github.com/okta/okta-auth-js/pull/656) Adds `token.renewTokensWithRefresh`

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
- [#503](https://github.com/okta/okta-auth-js/pull/503) Supports relative uri for [options.redirectUri](README.md#configuration-options)
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
  - `onSessionExpired` option has been removed. [TokenManager events](README.md#tokenmanageronevent-callback-context) can be used to detect and handle token renewal errors.
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

New [option](README.md#configuration-options) `cookies` allows overriding default `secure` and `sameSite` values.

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

- [#317](https://github.com/okta/okta-auth-js/pull/317) - `pkce` [option](README.md#configuration-options)  is now `true` by default. `grantType` option is removed.

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
