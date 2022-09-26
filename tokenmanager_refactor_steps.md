:warning: Remove this file if this PR will be merged

## Goals

* Be able to support multiple token sets (accessToken, idToken, refreshToken) by using authjs instance
* Avoid dramatic public interfaces change
* Refactor should be tree-shaking wise

## Plan

- [ ] move emitter to TokenManger
  * non breaking change
- [ ] combine AuthStateManager & ServiceManager into TokenManager
  * we can keep the top level instance to avoid breaking change in current version
  * add deprecate tag and remove in the next major version
- [ ] move top level methods from oidc mixin to core mixin
  * non-breaking change
- [ ] add top level public method `setTokenManager` to update the only one instance of tokenManager in authjs instance, so all top level wrapper methods can still work
  * non-breaking change
- [ ] add doc to explain how to use TokenManager in isolated mode
- [ ] move TokenManager from oidc module to core, and remove direct use of tokenManager from oidc - tree shaking wise
  * breaking change