#  Future of AuthJS `autoRenew`

We have been tracking the changes browsers have been making to long running timers, especially in inactive tabs, and have begun to receive reports of flaky and unpredictable behavior from our [Active AutoRenew](../README.md#autorenew-1). We have spiked on the usage of Web Worker based timers, however we decided not to move forward with that approach. Active AutoRenew served it's purpose, however the introduction of [refresh tokens](https://developer.okta.com/docs/guides/refresh-tokens/main/#about-refresh-tokens) have made it a bit antiquated. A better, more reliable approach to token renewal is renewing the token (if needed) when tokens are read from storage. The [isAuthenticated()](../README.md#isauthenticatedoptions) method already does this and we have added a new method [getOrRenewAccessToken()](../README.md#getorrenewaccesstoken) for convenience. Unfortunately we cannot make this the default behavior when tokens are read because storage operations are not `async` and performing a token renewal results in http request.

Moving forward, we recommend the following configuration

```javascript
const config = {
  tokenManager: {
    autoRenew: true,
  },
  services: {
    autoRenew: false,
    autoRemove: false,
  }
};
const authClient = new OktaAuth(config);
```
*(disables `active` autoRenew, enables `passive` autoRenew, [reference]((../README.md#autorenew-1)))*

Example Resource Request
```javascript
  async function authenticatedFetch(url, options={}) {
    const accessToken = await authClient.getOrRenewAccessToken();
    const headers = new Headers(options.headers);
    headers.append('Authorization', `Bearer ${accessToken}`);
    return fetch(url, {...options, headers});
  }
```
