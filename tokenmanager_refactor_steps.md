* combine AuthStateManager & ServiceManager into TokenManager 
* move TokenManager from oidc module to core, and remove direct use of tokenManager from oidc - tree shaking wise
* move top level methods from oidc mixin to core mixin
* add top level public method `setTokenManager` to update the only one instance of tokenManager in authjs instance, so all top level wrapper methods can still work