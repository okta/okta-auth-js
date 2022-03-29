# MyAccount API

## Introduction

MyAccount APIs enables everything needed for the customer's end user to manage one's account. The API assumes the access token is obtained through the OAuth2 either by the classic or IDX flow.

Certain token scopes will be needed to gain the permission to read/manage the account resources:

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

## How to access API methods

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

```html
<script src="https://global.oktacdn.com/okta-auth-js/6.5.0/okta-auth-js.min.js" type="text/javascript"></script>
```

> :warning: The version shown in this sample may be older than the current version. We recommend using the highest version available

Then you can create an instance of the `OktaAuth` object, available globally, then access MyAccount API methods under `myaccount` namespace.

```javascript
const oktaAuth = new OktaAuth({
  // config
});
const emails = await oktaAuth.myaccount.getEmails();
```

## API reference documentation

See [MyAccount API reference documentation](/docs/myaccount/modules/index.md) for detailed API definitions.