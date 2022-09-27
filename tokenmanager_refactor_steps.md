:warning: Remove this file if this PR will be merged

## Goals

* Be able to support multiple token sets (accessToken, idToken, refreshToken) by using authjs instance
* Avoid dramatic public interfaces change (default entry)
* Refactor should be tree-shaking wise

## Plan

### Non breaking changes:

- [x] move emitter to TokenManger
  * mark top level emitter as deprecated
  * create new instance in tokenManager
- [x] move TokenManager from oidc module to core
- [x] move top level methods from oidc mixin to core mixin
- [ ] combine AuthStateManager & ServiceManager into TokenManager
  * we can keep the top level instance to avoid breaking change in current version
  * add deprecate tag and remove in the next major version
- [ ] add top level public method `setTokenManager` to update the only one instance of tokenManager in authjs instance, so all top level wrapper methods can still work
### Breaking changes:

- [ ] remove direct use of tokenManager from oidc - tree shaking wise
- [ ] remove named exports of `AuthStateManager`

### Docs

- [ ] add doc to explain how to use TokenManager in isolated mode