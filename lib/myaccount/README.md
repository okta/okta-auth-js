# MyAccount API

## Introduction

MyAccount APIs enables end user account management in SPA applications. The API requires an access token obtained via OAuth flows with additional [scopes](#scopes).

## Scopes

The following scopes are required for permission to read/write the resources exposed by the MyAccount API:

**profile:**
```
okta.myAccount.profile.read
okta.myAccount.profile.manage
```

**email:**
```
okta.myaccount.email.read
okta.myaccount.email.manage
```

**phone:**
```
okta.myaccount.phone.read
okta.myaccount.phone.manage
```

## Accessing API methods

### Via NPM module

MyAccount API is published as a submodule under `@okta/okta-auth-js` package, you can access the myaccount module by following the snippets below:

**ES module:**

```js
import { getEmails } from '@okta/okta-auth-js/myaccount';
```

**CommonJS:**

```js
const { getEmails } = require('@okta/okta-auth-js/myaccount');
```

### Via CDN

The built library bundle is also available on our global CDN. Include the following script in your HTML file to load before your application script:

> :warning: The version shown in this sample may be older than the current version. We recommend using the highest version available

```html
<script src="https://global.oktacdn.com/okta-auth-js/6.7.0/okta-auth-js.min.js" type="text/javascript"></script>
```

Then you can create an instance of the `OktaAuth` object, available globally, then access MyAccount API methods under `myaccount` namespace.

```javascript
const oktaAuth = new OktaAuth({
  // config
});
const emails = await oktaAuth.myaccount.getEmails();
```

## Using types

Types are exposed from both module level and SDK entries, for environment with typescript version 4.7 or above, you can import types from both module and SDK entries. But if you are with lower typescript versions, please import types from the main SDK entry.

See [typescript release notes](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-rc/#package-json-exports-imports-and-self-referencing) for detailed information.

**Import from module entry**

```js
import { getEmail } from '@okta/okta-auth-js/myaccount';
```

**Import from SDK entry**

```js
import { getEmail } from '@okta/okta-auth-js';
```

## Handling `insufficient_authentication_context` error

For additional security, the MyAccount API requires a higher assurance level to protect the end user's account from being manipulated by malicious actors. If the `access token` provided does not meet the required assurance level, an error will be thrown to prompt the user to re-authenticate. Applications consuming the MyAccount API will need to handle this error condition. When this occurs, `myaccount` methods will throw an `AuthApiError` with `insufficient_authentication_context` in `errorSummary` having `max_age` and `acr_values` in `meta` field, like so:


```js
{
  name: 'AuthApiError',
  errorSummary: 'insufficient_authentication_context',
  errorCauses: [{
    errorSummary: 'The access token requires additional assurance to access the resource'
  }],
  meta: {
    max_age: 900,
    acr_values: 'phr'
  }
}
```

## Re-authentication Approaches:

### Re-Authenticate with Okta Hosted Login flow

Bootstrap re-authentication flow by calling `getWithRedirect` with `maxAge` and `acrValues`.

```js
await getWithRedirect(
  oktaAuth,
  {
    prompt: 'login',
    maxAge,
    acrValues,
    scopes,
    extraParams: {
      id_token_hint: idToken
    }
  }
);
```

### Re-Authenticate with Embedded SDK

Bootstrap re-authentication flow by calling `oktaAuth.idx.authenticate` with `maxAge` and `acrValues`.

```js
const transaction = await oktaAuth.idx.authenticate({ maxAge, acrValues });
// then render form based on new transaction
```

### Re-Authenticate with Embedded Widget

Bootstrap embedded widget by passing `max_age` and `acr_values` in `authParams`. Then start authentication flow from there.


```js
const { issuer, clientId, redirectUri, scopes } = oidcConfig;
const widget = new OktaSignIn({
  baseUrl: issuer.split('/oauth2')[0],
  clientId,
  redirectUri,
  authParams: {
    scopes,
    ...(maxAge && { maxAge }),
    ...(acrValues && { acrValues }),
  },
  useInteractionCodeFlow: true,
});
```

## API reference documentation

See [MyAccount API reference documentation](/docs/myaccount/modules.md) for detailed API definitions.
