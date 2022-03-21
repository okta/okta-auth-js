[devforum]: https://devforum.okta.com/
[lang-landing]: https://developer.okta.com/code/javascript
[github-issues]: https://github.com/okta/okta-auth-js/issues
[github-releases]: https://github.com/okta/okta-auth-js/releases
[social-login]: https://developer.okta.com/docs/concepts/social-login/
[localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[sessionStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[cookie]: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

[<img src="https://www.okta.com/sites/default/files/Dev_Logo-01_Large-thumbnail.png" align="right" width="256px"/>](https://devforum.okta.com/)

[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)](https://devforum.okta.com)
[![Build Status](https://travis-ci.org/okta/okta-auth-js.svg?branch=master)](https://travis-ci.org/okta/okta-auth-js)
[![npm version](https://img.shields.io/npm/v/@okta/okta-auth-js.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-auth-js)

# Okta Auth JavaScript SDK

* [Release status](#release-status)
* [Need help?](#need-help)
  * [Browser compatibility / polyfill](#browser-compatibility--polyfill)
  * [Third party cookies](#third-party-cookies)
* [Getting started](#getting-started)
* [Usage guide](#usage-guide)
* [Strategies for Obtaining Tokens](#strategies-for-obtaining-tokens)
* [Configuration reference](#configuration-reference)
* [API Reference](#api-reference)
* [Building the SDK](#building-the-sdk)
* [Node JS and React Native Usage](#node-js-and-react-native-usage)
* [Migrating from previous versions](#migrating-from-previous-versions)
* [Contributing](#contributing)

The Okta Auth JavaScript SDK builds on top of our [Authentication API](https://developer.okta.com/docs/api/resources/authn) and [OpenID Connect & OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc) to enable you to create a fully branded sign-in experience using JavaScript.

You can learn more on the [Okta + JavaScript][lang-landing] page in our documentation.

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/).

## Release Status

:heavy_check_mark: The current stable major version series is: `6.x`

| Version   | Status                           |
| -------   | -------------------------------- |
| `6.x`     | :heavy_check_mark: Stable        |
| `5.x`     | :warning: Retiring on 2022-10-31 |
| `4.x`     | :x: Retired                      |
| `3.x`     | :x: Retired                      |
| `2.x`     | :x: Retired                      |
| `1.x`     | :x: Retired                      |
| `0.x`     | :x: Retired                      |

The latest release can always be found on the [releases page][github-releases].

## Need help?

If you run into problems using the SDK, you can:

* Ask questions on the [Okta Developer Forums][devforum]
* Post [issues][github-issues] here on GitHub (for code errors)

Users migrating from previous versions of this SDK should see [Migrating Guide](#migrating-from-previous-versions) to learn what changes are necessary.

### Browser compatibility / polyfill

This SDK is known to work with current versions of Chrome, Firefox, and Safari on desktop and mobile.

Compatibility with IE 11 / Edge can be accomplished by adding polyfill/shims for the following objects:

* ES Promise
* Array.from
* TextEncoder
* Object.assign
* UInt8 typed array
* webcrypto (crypto.subtle)

> :warning: crypto polyfills are unable to use the operating system as a source of good quality entropy used to generate pseudo-random numbers that are the key to good cryptography.  As such we take the posture that crypto polyfills are less secure and we advise against using them.

This module provides an entrypoint that implements all required polyfills.

If you are using the JS on a web page from the browser, you can copy the `node_modules/@okta/okta-auth-js/dist` contents to publicly hosted directory, and include a reference to the `okta-auth-js.polyfill.js` file in a `<script>` tag. It should be loaded before any other scripts which depend on the polyfill.  

If you're using a bundler like [Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/), you can simply import import or require `@okta/okta-auth-js/polyfill` at or near the beginning of your application's code:

```javascript
import '@okta/okta-auth-js/polyfill';
```

or

```javascript
require('@okta/okta-auth-js/polyfill');
```

The built polyfill bundle is also available on our global CDN. Include the following script in your HTML file to load before any other scripts:

```html
<script src="https://global.oktacdn.com/okta-auth-js/5.2.2/okta-auth-js.polyfill.js" type="text/javascript"></script>
```

> :warning: The version shown in this sample may be older than the current version. We recommend using the highest version available

### Third party cookies

Many browsers have started blocking cross-origin or "third party" cookies by default. Although most of the Okta APIs supported by this SDK do not rely upon cookies, there are a few methods which do. These methods will break if third party cookies are blocked:

* [session](#session) APIs require access to cookies stored on the Okta domain.
  * [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi)
  * [session.exists](#sessionexists)
  * [session.get](#sessionget)
  * [session.refresh](#sessionrefresh)
  * [closeSession](#closesession)
* [token](#token)
  * [token.getWithoutPrompt](#tokengetwithoutpromptoptions) must have access to cookies on the Okta domain via an iFrame running on your application's page.
  * [token.renew](#tokenrenewtokentorenew) uses [token.getWithoutPrompt](#tokengetwithoutpromptoptions) and is subject to the same limitations.

If your application depends on any of these methods, you should try to either rewrite your application to avoid using these methods or communicate to your users that they must enable third party cookies. Okta engineers are currently working on a better long-term solution to this problem.

## Getting started

Installing the Authentication SDK is simple. You can include it in your project via our npm package, [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js).

You'll also need:

* An Okta account, called an _organization_ (sign up for a free [developer organization](https://developer.okta.com/signup) if you need one)
* An Okta application, which can be created using the Okta Admin UI

### Creating your Okta application

When creating a new Okta application, you can specify the application type. This SDK is designed to work with `SPA` (Single-page Applications) or `Web` applications. A `SPA` application will perform all logic and authorization flows client-side. A `Web` application will perform authorization flows on the server.

### Configuring your Okta application

From the Okta Admin UI, click `Applications`, then select your application. You can view and edit your Okta application's configuration under the application's `General` tab.

#### Client ID

A string which uniquely identifies your Okta application.

#### Login redirect URIs

To sign users in, your application redirects the browser to an Okta-hosted sign-in page. Okta then redirects back to your application with information about the user. You can learn more about how this works on [Okta-hosted flows](https://developer.okta.com/docs/concepts/okta-hosted-flows/).

You need to whitelist the login redirect URL in your Okta application settings.

#### Logout redirect URIs

After you sign users out of your app and out of Okta, you have to redirect users to a specific location in your application. You need to whitelist the post sign-out URL in your Okta application settings.

### Using the npm module

Using our npm module is a good choice if:

* You have a build system in place where you manage dependencies with npm.
* You do not want to load scripts directly from third party sites.

To install [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js):

```bash
# Run this command in your project root folder.
# yarn
yarn add @okta/okta-auth-js

# npm
npm install --save @okta/okta-auth-js
```

If you are using the JS on a web page from the browser, you can copy the `node_modules/@okta/okta-auth-js/dist` contents to publicly hosted directory, and include a reference to the `okta-auth-js.min.js` file in a `<script>` tag.  

The built library bundle is also available on our global CDN. Include the following script in your HTML file to load before your application script:

```html
<script src="https://global.oktacdn.com/okta-auth-js/5.2.2/okta-auth-js.min.js" type="text/javascript"></script>
```

> :warning: The version shown in this sample may be older than the current version. We recommend using the highest version available

Then you can create an instance of the `OktaAuth` object, available globally.

```javascript
const oktaAuth = new OktaAuth({
  // config
})
```

However, if you're using a bundler like [Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/), you can simply import the module or require using CommonJS.

```javascript
// ES module
import { OktaAuth } from '@okta/okta-auth-js'
const authClient = new OktaAuth(/* configOptions */)
```

```javascript
// CommonJS
var OktaAuth = require('@okta/okta-auth-js').OktaAuth;
var authClient = new OktaAuth(/* configOptions */);
```

## Usage guide

For an overview of the client's features and authentication flows, check out [our developer docs](https://developer.okta.com/code/javascript/okta_auth_sdk). There, you will learn how to use the Auth SDK on a simple static page to:

* Retrieve and store an OpenID Connect (OIDC) token
* Get an Okta session

> :warning: The developer docs may be written for an earlier version of this library. See [Migrating from previous versions](#migrating-from-previous-versions).

You can also browse the full [API reference documentation](#api-reference).

> :hourglass: Async methods return a promise which will resolve on success. The promise may reject if an error occurs.

### Example Client

```javascript
var config = {
  // Required config
  issuer: 'https://{yourOktaDomain}/oauth2/default',

  // Required for login flow using getWithRedirect()
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',

  // Parse authorization code from hash fragment instead of search query
  responseMode: 'fragment',

  // Configure TokenManager to use sessionStorage instead of localStorage
  tokenManager: {
    storage: 'sessionStorage'
  }
};

var authClient = new OktaAuth(config);
```

### Running as a service

By default, creating a new instance of `OktaAuth` will not create any asynchronous side-effects. However, certain features such as [token auto renew](#autorenew), [token auto remove](#autoremove) and [cross-tab synchronization](#syncstorage) require `OktaAuth` to be running as a service. This means timeouts are set in the background which will continue working until the service is stopped.  To start the `OktaAuth` service, simply call the `start` method. To terminate all background processes, call `stop`. See [Service Configuration](#services) for more info.

```javascript
  var authClient = new OktaAuth(config);
  authClient.start(); // start the service
  authClient.stop(); // stop the service
```

Starting the service will also call [authStateManager.updateAuthState](#authstatemanagerupdateauthstate).

### Usage with Typescript

Types are implicitly provided by this library through the `types` entry in `package.json`. Types can also be referenced explicitly by importing them.

```typescript
import {
  OktaAuth,
  OktaAuthOptions,
  TokenManager,
  AccessToken,
  IDToken,
  UserClaims,
  TokenParams
} from '@okta/okta-auth-js'

const config: OktaAuthOptions = {
  issuer: 'https://{yourOktaDomain}'
}

const authClient: OktaAuth = new OktaAuth(config)
const tokenManager: TokenManager = authClient.tokenManager;
const accessToken: AccessToken = await tokenManager.get('accessToken') as AccessToken;
const idToken: IDToken = await tokenManager.get('idToken') as IDToken;
const userInfo: UserClaims = await authClient.getUserInfo(accessToken, idToken);

if (!userInfo) {
  const tokenParams: TokenParams = {
    scopes: ['openid', 'email', 'custom_scope'],
  }
  authClient.token.getWithRedirect(tokenParams);
}
```

#### Usage with Typescript < 3.6

Typescript versions prior to 3.6 have no type definitions for WebAuthn. 
Support for WebAuthn in IDX API was introduced in `OktaAuth 6.1.0`. 
To solve this issue please install package `@types/webappsec-credential-management` version `^0.5.1`. 

### Strategies for Obtaining Tokens

#### Authorization Code flow for web and native client types

Web and native clients can obtain tokens using the `authorization_code` flow which uses a client secret stored in a secure location. SPA applications should use the `PKCE` flow which does not use a client secret. To use the `authorization_code` flow, set `responseType` to `"code"` and `pkce` to `false`:

```javascript
var config = {
  // Required config
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',

  // Use authorization_code flow
  responseType: 'code',
  pkce: false
};

var authClient = new OktaAuth(config);
```

#### PKCE OAuth 2.0 flow

The PKCE OAuth flow will be used by default. This library includes built-in support for Node applications. PKCE is widely supported by most modern browsers when running on an HTTPS connection. PKCE requires that the browser implements `crypto.subtle` (also known as `webcrypto`). [Most modern browsers provide this](https://caniuse.com/#feat=cryptography) when running in a secure context (on an HTTPS connection). PKCE also requires the [TextEncoder](https://caniuse.com/#feat=textencoder) object. This is available on all major browsers except IE Edge. In this case, we recommend using a polyfill/shim such as [text-encoding](https://www.npmjs.com/package/text-encoding).

If the user's browser does not support PKCE, an exception will be thrown. You can test if a browser supports PKCE before construction with this static method:

`OktaAuth.features.isPKCESupported()`

#### Implicit OAuth 2.0 flow

Implicit OAuth flow is available as an option if PKCE flow cannot be supported in your deployment. It is widely supported by most browsers, and can work over an insecure HTTP connection. Note that implicit flow is less secure than PKCE flow, even over HTTPS, since raw tokens are exposed in the browser's history. For this reason, we highly recommending using the PKCE flow if possible.

Implicit flow can be enabled by setting the `pkce` option to `false`

```javascript

var config = {
  pkce:  false,

  // other config
  issuer: 'https://{yourOktaDomain}/oauth2/default',
};

var authClient = new OktaAuth(config);
```

### Redirects and Routing

**!** Routing is **optional** for the callback portion of the redirect strategy. Instead you can use [popup](#tokengetwithpopupoptions) or [sign widget](https://github.com/okta/okta-signin-widget).

To sign a user in, your application must redirect the browser to the Okta-hosted sign-in page.
> **Note:** Initial redirect to Okta-hosted sign-in page starts a transaction with a stateToken lifetime set to one hour.

After successful authentication, the browser is redirected back to your application along with information about the user.
Depending on your preferences it is possible to use the following callback strategies.

#### Handling the callback without routing

1. Create / configure your auth-js instance
2. Before making **any other calls with auth-js** at the VERY BEGINNING of the app call *token.isLoginRedirect* - if this returns true, call *parseFromUrl* and save tokens in storage manager.
      **It’s important that no other app logic runs until the async parseFromUrl / token manager logic is complete**
3. After continue normal app logic

#### Handling the callback with hash routing

According to the OAuth 2.0 spec the redirect URI "MUST NOT contain a fragment component": <https://tools.ietf.org/html/rfc6749#section-3.1.2>
When using a hash/fragment routing strategy and OAuth 2.0, the redirect callback will be the main / default route. The redirect callback flow will be very similar to [handling the callback without routing](#handling-the-callback-without-routing). We recommend defining the logic that will parse redirect url at the very beginning of your app, before any other authorization checks.

Additionally, if using hash routing, we recommend using PKCE and responseMode "query" (this is the default for PKCE). With implicit flow, tokens in the hash could cause unpredictable results since hash routers may rewrite the fragment.

#### Handling the callback with path routing (on a dedicated route)

1. Right before redirect, save the route you are on (we recommend sessionStorage)
2. Do the redirect to okta
3. Redirect back to a dedicated route
4. Call *parseFromUrl()*, retrieve tokens, add to `tokenManager`
5. Read saved route and redirect to it

## Configuration reference

Whether you are using this SDK to implement an OIDC flow or for communicating with the [Authentication API](https://developer.okta.com/docs/api/resources/authn), the only required configuration option is `issuer`, which is the URL to an Okta [Authorization Server](https://developer.okta.com/docs/guides/customize-authz-server/overview/)

### About the Issuer

You may use the URL for your Okta organization as the issuer. This will apply a default authorization policy and issue tokens scoped at the organization level.

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}'
};

var authClient = new OktaAuth(config);
```

Okta allows you to create multiple custom OAuth 2.0 authorization servers that you can use to protect your own resource servers. Within each authorization server you can define your own OAuth 2.0 scopes, claims, and access policies. Many organizations have a "default" authorization server.

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default'
};

var authClient = new OktaAuth(config);
```

You may also create and customize additional authorization servers.

```javascript

var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/custom-auth-server-id'
};

var authClient = new OktaAuth(config);
```

### Configuration options

These options can be included when instantiating Okta Auth JS (`new OktaAuth(config)`).

#### `issuer`

> :warning: This option is required

The URL for your Okta organization or an Okta authentication server. [About the issuer](#about-the-issuer)

#### `clientId`

Client Id pre-registered with Okta for the OIDC authentication flow. [Creating your Okta application](#creating-your-okta-appliation)

#### `redirectUri`

The url that is redirected to when using `token.getWithRedirect`. This must be listed in your Okta application's [Login redirect URIs](#login-redirect-uris). If no `redirectUri` is provided, defaults to the current origin (`window.location.origin`). [Configuring your Okta application](#configuring-your-okta-application)

#### `postLogoutRedirectUri`

Specify the url where the browser should be redirected after [signOut](#signout). This url must be listed in your Okta application's [Logout redirect URIs](#logout-redirect-uris). If not specified, your application's origin (`window.location.origin`) will be used.  [Configuring your Okta application](#configuring-your-okta-application) |

#### `scopes`

Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`. For a list of available scopes, see [Scopes and Claims](https://developer.okta.com/docs/api/resources/oidc#access-token-scopes-and-claims)

#### `state`

A client-provided string that will be passed to the server endpoint and returned in the OAuth response. The value can be used to validate the OAuth response and prevent cross-site request forgery (CSRF). Defaults to a random string.

#### `pkce`

Default value is `true` which enables the [PKCE OAuth Flow](#pkce-oauth-20-flow). To use the [Implicit Flow](#implicit-oauth-20-flow) or [Authorization Code Flow](#authorization-code-flow-for-web-and-native-client-types), set `pkce` to `false`.

#### responseMode

When requesting tokens using [token.getWithRedirect](#tokengetwithredirectoptions) values will be returned as parameters appended to the [redirectUri](#configuration-options).

In most cases you will not need to set a value for `responseMode`. Defaults are set according to the [OpenID Connect 1.0 specification](https://openid.net/specs/openid-connect-core-1_0.html#Authentication).

* For [PKCE OAuth Flow](#pkce-oauth-20-flow)), the authorization code will be in search query of the URL. Clients using the PKCE flow can opt to instead receive the authorization code in the hash fragment by setting the [responseMode](#configuration-options) option to "fragment".

* For [Implicit OAuth Flow](#implicit-oauth-20-flow)), tokens will be in the hash fragment of the URL. This cannot be changed.

#### `responseType`

Specify the [response type](https://developer.okta.com/docs/api/resources/oidc#request-parameters) for OIDC authentication when using the [Implicit OAuth Flow](#implicit-oauth-20-flow). The default value is `['token', 'id_token']` which will request both an access token and ID token. If `pkce` is `true`, both the access and ID token will be requested and this option will be ignored. For web/native applications using the `authorization_code` flow, this value should be set to `"code"` and `pkce` should be set to `false`.

#### `authorizeUrl`

Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize".

#### `userinfoUrl`

Specify a custom userinfoUrl. Defaults to the issuer plus "/v1/userinfo".

#### `tokenUrl`

Specify a custom tokenUrl. Defaults to the issuer plus "/v1/token".

#### `ignoreSignature`

> :warning: This option should be used only for browser support and testing purposes.

ID token signatures are validated by default when `token.getWithoutPrompt`, `token.getWithPopup`,  `token.getWithRedirect`, and `token.verify` are called. To disable ID token signature validation for these methods, set this value to `true`.

#### `maxClockSkew`

Defaults to 300 (five minutes). This is the maximum difference allowed between a client's clock and Okta's, in seconds, when validating tokens. Setting this to 0 is not recommended, because it increases the likelihood that valid tokens will fail validation.

#### `ignoreLifetime`

Token lifetimes are validated using the `maxClockSkew`.
To override this and disable token lifetime validation, set this value to `true`. 

#### `transformAuthState`

Callback function. When [updateAuthState](#authstatemanagerupdateauthstate) is called a new authState object is produced. Providing a `transformAuthState` function allows you to modify or replace this object before it is stored and emitted. A common use case is to change the meaning of [isAuthenticated](#authstatemanager). By default, `updateAuthState` will set `authState.isAuthenticated` to true if unexpired tokens are available from [tokenManager](#tokenmanager). This logic could be customized to also require a valid Okta SSO session:

```javascript
const config = {
  // other config
  transformAuthState: async (oktaAuth, authState) => {
    if (!authState.isAuthenticated) {
      return authState;
    }
    // extra requirement: user must have valid Okta SSO session
    const user = await oktaAuth.token.getUserInfo();
    authState.isAuthenticated = !!user; // convert to boolean
    authState.users = user; // also store user object on authState
    return authState;
  }
};

const oktaAuth = new OktaAuth(config);
oktaAuth.authStateManager.subscribe(authState => {
  // handle latest authState
});
oktaAuth.authStateManager.updateAuthState();
```

#### `restoreOriginalUri`

> :link: web browser only <br>

Callback function. When [sdk.handleLoginRedirect](#handleloginredirecttokens) is called, by default it uses `window.location.replace` to redirect back to the [originalUri](#setoriginaluriuri). This option overrides the default behavior.

```javascript
const config = {
  // other config
  restoreOriginalUri: async (oktaAuth, originalUri) => {
    // redirect with custom router
    router.replace({
      path: toRelativeUrl(originalUri, baseUrl)
    });
  }
};

const oktaAuth = new OktaAuth(config);
if (oktaAuth.isLoginRedirect()) {
  try {
    await oktaAuth.handleLoginRedirect();
  } catch (e) {
    // log or display error details
  }
}
```

#### `devMode`

Default to `false`. It enables debugging logs when set to `true`.

#### `useInteractionCodeFlow`

Enables interaction code flow for direct auth clients.

#### `clientSecret`

Used in authorization and interaction code flows by server-side web applications to obtain OAuth tokens. In a production application, this value should **never** be visible on the client side.

#### `httpRequestClient`

The http request implementation. By default, this is implemented using [cross-fetch](https://github.com/lquixada/cross-fetch). To provide your own request library, implement the following interface:

  1. Must accept:
      * method (http method)
      * url (target url)
      * args (object containing headers and data)
  2. Must return a Promise that resolves with a raw XMLHttpRequest response

```javascript
var config = {
  url: 'https://{yourOktaDomain}',
  httpRequestClient: function(method, url, args) {
    // args is in the form:
    // {
    //   headers: {
    //     headerName: headerValue
    //   },
    //   data: postBodyData,
    //   withCredentials: true|false,
    // }
    return Promise.resolve(/* a raw XMLHttpRequest response */);
  }
}
```

#### `storageManager`

The `storageManager` provides access to client storage for specific purposes. `storageManager` configuration is divided into named sections. The default configuration is shown below:

```javascript

var config = {
  storageManager: {
    token: {
      storageTypes: [
        'localStorage',
        'sessionStorage',
        'cookie'
      ],
    },
    cache: {
      storageTypes: [
        'localStorage',
        'sessionStorage',
        'cookie'
      ]
    },
    transaction: {
      storageTypes: [
        'sessionStorage',
        'localStorage',
        'cookie'
      ]
    }
  }
}
```

**Important:** If neither [localStorage][] nor [sessionStorage][] are available, the default storage provider may fall back to using [cookie][] storage on some clients, . If your site will always be served over a HTTPS connection, you may want to forcibly enable "secure" cookies. This option will prevent cookies from being stored on an HTTP connection.

```javascript
var config = {
  cookies: {
    secure: true
  }
}
```

##### `storageType`

The following values for `storageType` are recognized:

* `memory`: values are stored in a closure and will not survive a page reload
* `sessionStorage`: will only be available to the current browser tab
* `localStorage`: available to all browser tabs
* `cookie`: available to all browser tabs, and server-side code

**Note:** If the specified `storageType` is not available, but matches an entry in `storageTypes`, then default fallback logic will be applied. To disable this behavior, set `storageTypes` to an empty array:

```javascript
var config = {
  storageManager: {
    token: {
      storageType: 'sessionStorage',
      storageTypes: []
    }
  }
}
```

or set the `storageTypes` property with only one entry:

```javascript
var config = {
  storageManager: {
    token: {
      storageTypes: ['sessionStorage']
    }
  }
}
```

If fallback logic is disabled, the [storageManager](#storagemanager) may throw an exception if an instance of the given `storageType` cannot be created.

##### `storageTypes`

A list of storageTypes, in order of preference. If a type is not available, the next type in the list will be tried.

##### `storageProvider`

This option allows you to pass a custom storage provider instance. If a `storageProvider` is set, the `storageType` will be ignored.

**Important:** A storage provider will receive sensitive data, such as the user's raw tokens, as a readable string. Any custom storage provider should take care to save this string in a secure location which is not accessible to unauthorized users.

A `storageProvider` must provide a simple but specific API to access client storage. An example of a `storageProvider` is the built-in [localStorage][]. It has a method called `getItem` that returns a string for a key and a method called `setItem` which accepts a string and key.

A custom storage provider must implement two functions:

* `getItem(key)`
* `setItem(key, value)`

Optionally, a storage provider can also implement a `removeItem` function. If `removeItem` is not implemented, values will be cleared but keys will persist.

```javascript
const myMemoryStore = {};
const storageProvider = {
  getItem: function(key) {
    // custom get
    return myMemoryStore[key];
  },
  setItem: function(key, val) {
    // custom set
    myMemoryStore[key] = val;
  },
  // optional
  removeItem: function(key) {
    delete myMemoryStore[key];
  }
}

var config = {
  storageManager: {
    token: {
      storageProvider: storageProvider
    }
  }
}
```

#### `tokenManager`

If `cookie` storage is specified, it is possible to specify whether or not a session cookie is used by the cookie storage. This will automatically be configured if `sessionStorage` is specified and you fall back to `cookie` storage. If sessionCookie is not specified it will create a cookie with an expiry date of `2200-01-01T00:00:00.000Z`

```javascript
var config = {
  cookies: {
    sessionCookie: true
  }
}
```

##### `autoRenew`
> :warning: Moved to [TokenService](#tokenservice). For backwards compatibility will set `services.tokenService.autoRenew`

##### `expireEarlySeconds`

> :warning: DEV ONLY

To facilitate a more stable user experience, tokens are considered expired 30 seconds before actual expiration time. You can customize this value by setting the `expireEarlySeconds` option. The value should be large enough to account for network latency and clock drift between the client and Okta's servers.

**NOTE** `expireEarlySeconds` option is only allowed in the **DEV** environment (localhost). It will be reset to 30 seconds when running in environments other than **DEV**.

```javascript
// Emit expired event 2 minutes before expiration
// Tokens accessed with tokenManager.get() will auto-renew within 2 minutes of expiration
tokenManager: {
  expireEarlySeconds: 120
}
```

##### `autoRemove`
> :warning: Moved to [TokenService](#tokenservice). For backwards compatibility will set `services.tokenService.autoRenew`

##### `syncStorage`
> :warning: Moved to [SyncStorageService](#syncstorageservice). For backwards compatibility will set `services.syncStorageService.enable`

##### `storageKey`

By default all tokens will be stored under the key `okta-token-storage`. You may want to change this if you have multiple apps running on a single domain which share the same storage type. Giving each app a unique storage key will prevent them from reading or writing each other's token values.

##### `storage`

Specify the [storage type](#storagetype) for tokens. This will override any value set for the `token` section in the [storageManager](#storagemanager) configuration. By default, [localStorage][] will be used. This will fall back to [sessionStorage][] or [cookie][] if the previous type is not available. You may pass an object or a string. If passing an object, it should meet the requirements of a [custom storage provider](#storage). Pass a string to specify one of the built-in storage types:

* [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (default)
* [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
* [`cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
* `memory`: a simple in-memory storage provider

```javascript

var config = {
  url: 'https://{yourOktaDomain}',
  tokenManager: {
    storage: 'sessionStorage'
  }
};

var authClient = new OktaAuth(config);
```

A custom [storage provider](#storageprovider) instance can also be passed here. (This will override any `storageProvider` value set under the `token` section of the [storageManager](#storagemanager) configuration)

```javascript
var myMemoryStore = {};
const storageProvider = {
  getItem: function(key) {
    // custom get
    return myMemoryStore[key];
  },
  setItem: function(key, val) {
    // custom set
    myMemoryStore[key] = val;
  },
  // optional
  removeItem: function(key) {
    delete myMemoryStore[key];
  }
}

const config = {
  url: 'https://{yourOktaDomain}',
  tokenManager: {
    storage: storageProvider
  }
};

const authClient = new OktaAuth(config);
const tokens = await authClient.token.getWithoutPrompt();
authClient.tokenManager.setTokens(tokens); // storageProvider.setItem

```

#### `cookies`

An object containing additional properties used when setting cookies

##### `secure`

Defaults to `true`, unless the application origin is `http://localhost`, in which case it is forced to `false`. If `true`, the SDK will set the "Secure" option on all cookies. When this option is `true`, an exception will be thrown if the application origin is not using the HTTPS protocol. Setting to `false` will allow setting cookies on an HTTP origin, but is not recommended for production applications.

##### `sameSite`

Defaults to `none` if the `secure` option is `true`, or `lax` if the `secure` option is false. Allows fine-grained control over the same-site cookie setting. A value of `none` allows embedding within an iframe. A value of `lax` will avoid being blocked by user "3rd party" cookie settings. A value of `strict` will block all cookies when redirecting from Okta and is not recommended.

#### `clearPendingRemoveTokens`

Defaults to `true`, set this option to false if you want to opt-out of the default clearing pendingRemove tokens behaviour when `tokenManager.start()` is called.

### `services`
> :gear: Requires a [running service](#running-as-a-service)
The following configurations require `OktaAuth` to be running as a service. See [running service](#running-as-a-service) for more info.

Default configuration:
```javascript
services: {
  autoRenew: true,
  autoRemove: true,
  syncStorage: true,
}
```

#### `autoRenew`
When `true`, the library will attempt to renew tokens before they expire. If you wish to manually control token renewal, set `autoRenew` to `false` to disable this feature. You can listen to [`expired`](#tokenmanageronevent-callback-context) events to know when the token has expired.

> **NOTE** tokens are considered `expired` slightly before their actual expiration time. For more info, see [expireEarlySeconds](#expireearlyseconds).

In version `6.X`, the `autoRenew` configuration was set in `config.tokenManager`. To maintain backwards compatibility, this configuration is still respected but with a slight caveat. `tokenManager.autoRenew` configures 2 token auto renew strategies, `active` and `passive`.
*  `active` - Network requests are made in the background in an attempt to refresh tokens before they are truly expired to maintain a seamless UX.
    > :warning: this can cause an unintended side effect where the session never expires because it is constantly being refreshed (extended) before the actual expiration time
*  `passive` - Token refresh attempts are only made when `oktaAuth.isAuthenticated` is called and the current tokens are determined to be expired.

When `tokenManager.autoRenew` is `true` both renew strategies are enabled. To disable the `active` strategy, set `tokenManager.autoRenew` to `true` and `services.autoRenew` to `false`. To disable both renew strategies set either `tokenManager.autoRenew` or `services.autoRenew` to `false`

#### `autoRemove`
By default, the library will attempt to remove expired tokens when `autoRenew` is `false`. If you wish to disable auto removal of tokens, set `autoRemove` to `false`.

#### `syncStorage`
Automatically syncs tokens across browser tabs when token storage is `localStorage`. To disable this behavior, set `syncStorage` to false.

This is accomplished by selecting a single tab to handle the network requests to refresh the tokens and broadcasting to the other tabs. This is done to avoid all tabs sending refresh requests simultaneously, which can cause rate limiting/throttling issues.

## API Reference
<!-- no toc -->
* [start](#start)
* [stop](#stop)
* [signIn](#signinoptions)
* [signInWithCredentials](#signinwithcredentialsoptions)
* [signInWithRedirect](#signinwithredirectoptions)
* [signOut](#signout)
* [closeSession](#closesession)
* [revokeAccessToken](#revokeaccesstokenaccesstoken)
* [revokeRefreshToken](#revokerefreshtokenrefreshtoken)
* [forgotPassword](#forgotpasswordoptions)
* [unlockAccount](#unlockaccountoptions)
* [verifyRecoveryToken](#verifyrecoverytokenoptions)
* [webfinger](#webfingeroptions)
* [fingerprint](#fingerprintoptions)
* [isAuthenticated](#isauthenticatedoptions)
* [getUser](#getuser)
* [getIdToken](#getidtoken)
* [getAccessToken](#getaccesstoken)
* [storeTokensFromRedirect](#storetokensfromredirect)
* [setOriginalUri](#setoriginaluriuri)
* [getOriginalUri](#getoriginaluristate)
* [removeOriginalUri](#removeoriginaluri)
* [isLoginRedirect](#isloginredirect)
* [handleLoginRedirect](#handleloginredirecttokens)
* [setHeaders](#setheaders)
* [tx.resume](#txresume)
* [tx.exists](#txexists)
* [transaction.status](#transactionstatus)
* [session](#session)
  * [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi)
  * [session.exists](#sessionexists)
  * [session.get](#sessionget)
  * [session.refresh](#sessionrefresh)
* [idx](#idx)
* [token](#token)
  * [token.getWithoutPrompt](#tokengetwithoutpromptoptions)
  * [token.getWithPopup](#tokengetwithpopupoptions)
  * [token.getWithRedirect](#tokengetwithredirectoptions)
  * [token.parseFromUrl](#tokenparsefromurloptions)
  * [token.decode](#tokendecodeidtokenstring)
  * [token.renew](#tokenrenewtokentorenew)
  * [token.getUserInfo](#tokengetuserinfoaccesstokenobject-idtokenobject)
  * [token.verify](#tokenverifyidtokenobject)
  * [token.isLoginRedirect](#tokenisloginredirect)
  * [token.prepareTokenParams](#tokenpreparetokenparams)
  * [token.exchangeCodeForTokens](#tokenexchangecodefortokens)
* [tokenManager](#tokenmanager-api)
  * [tokenManager.add](#tokenmanageraddkey-token)
  * [tokenManager.get](#tokenmanagergetkey)
  * [tokenManager.getTokens](#tokenmanagergettokens)
  * [tokenManager.setTokens](#tokenmanagersettokenstokens)
  * [tokenManager.remove](#tokenmanagerremovekey)
  * [tokenManager.clear](#tokenmanagerclear)
  * [tokenManager.renew](#tokenmanagerrenewkey)
  * [tokenManager.on](#tokenmanageronevent-callback-context)
  * [tokenManager.off](#tokenmanageroffevent-callback)
* [authStateManager](#authstatemanager)
  * [authStateManager.getAuthState](#authstatemanagergetauthstate)
  * [authStateManager.updateAuthState](#authstatemanagerupdateauthstate)
  * [authStateManager.subscribe](#authstatemanagersubscribehandler)
  * [authStateManager.unsubscribe](#authstatemanagerunsubscribehandler)
* [http](#http)
  * [http.setRequestHeader](#httpsetrequestheader)

------

### `start()`

Starts the `OktaAuth` service. See [running as a service](#running-as-a-service) for more details.

### `stop()`

Starts the `OktaAuth` service. See [running as a service](#running-as-a-service) for more details.

### `signIn(options)`

> :warning: Deprecated, this method will be removed in next major release, use [signInWithCredentials](#signinwithcredentialsoptions) instead.

### `signInWithCredentials(options)`

See [authn API](docs/authn.md#signinwithcredentials).

### `signInWithRedirect(options)`

> :link: web browser only <br>
> :hourglass: async

Starts the full-page redirect to Okta with [optional request parameters](#authorize-options). In this flow, there is a originalUri parameter in options to track the route before the user signIn, and the addtional params are mapped to the [Authorize options](#authorize-options).
You can use [storeTokensFromRedirect](#storetokensfromredirect) to store tokens and [getOriginalUri](#getoriginaluristate) to clear the intermediate state (the originalUri) after successful authentication.

```javascript
if (authClient.isLoginRedirect()) {
  try {
    await authClient.handleLoginRedirect();
  } catch (e) {
    // log or display error details
  }
} else if (!await authClient.isAuthenticated()) {
  // Start the browser based oidc flow, then parse tokens from the redirect callback url
  authClient.signInWithRedirect();
} else {
  // User is authenticated
}
```

### `signOut()`

> :hourglass: async
> :link: web browser only

Signs the user out of their current [Okta session](https://developer.okta.com/docs/api/resources/sessions) and clears all tokens stored locally in the `TokenManager`. By default, the refresh token (if any) and access token are revoked so they can no longer be used. Some points to consider:

* Will redirect to an Okta-hosted page before returning to your app.
* If a `postLogoutRedirectUri` has not been specified or configured, `window.location.origin` will be used as the return URI. This URI must be listed in the Okta application's [Login redirect URIs](#login-redirect-uris). If the URI is unknown or invalid the redirect will end on a 400 error page from Okta. This error will be visible to the user and cannot be handled by the app.
* Requires a valid ID token. If an ID token is not available, `signOut` will fallback to using the XHR-based [closeSession](#closesession) method. This method may fail to sign the user out if 3rd-party cookies have been blocked by the browser.
* For more information, see [Logout](https://developer.okta.com/docs/reference/api/oidc/#logout) in the OIDC API documentation.

`signOut` takes the following options:

* `postLogoutRedirectUri` - Setting a value will override the `postLogoutRedirectUri` configured on the SDK.
* `state` - An optional value, used along with `postLogoutRedirectUri`. If set, this value will be returned as a query parameter during the redirect to the `postLogoutRedirectUri`
* `idToken` - Specifies the ID token object. By default, `signOut` will look for a token object named `idToken` within the `TokenManager`. If you have stored the id token object in a different location, you should retrieve it first and then pass it here.
* `clearTokensBeforeRedirect` - If `true` (default: `false`) local tokens will be removed before the logout redirect happens. Otherwise a flag (`pendingRemove`) will be added to each local token instead of clearing them immediately. Calling `oktaAuth.start()` after logout redirect will clear local tokens if flags are found. **Use this option with care**: removing local tokens before fully terminating the Okta SSO session can result in logging back in again when using [`@okta/okta-react`](https://www.npmjs.com/package/@okta/okta-react)'s [`SecureRoute`](https://github.com/okta/okta-react#secureroute) component.
* `revokeAccessToken` - If `false` (default: `true`) the access token will not be revoked. Use this option with care: not revoking tokens may pose a security risk if tokens have been leaked outside the application.
* `revokeRefreshToken` - If `false` (default: `true`) the refresh token will not be revoked. Use this option with care: not revoking tokens may pose a security risk if tokens have been leaked outside the application.  Revoking a refresh token will revoke any access tokens minted by it, even if `revokeAccessToken` is `false`.
* `accessToken` - Specifies the access token object. By default, `signOut` will look for a token object named `accessToken` within the `TokenManager`. If you have stored the access token object in a different location, you should retrieve it first and then pass it here. This options is ignored if the `revokeAccessToken` option is `false`.

```javascript
// Sign out using the default options
authClient.signOut()
```

```javascript
// Override the post logout URI for this call
authClient.signOut({
  postLogoutRedirectUri: `${window.location.origin}/logout/callback`
});
```

```javascript
// In this case, the ID token is stored under the 'myIdToken' key
var idToken = await authClient.tokenManager.get('myIdToken');
authClient.signOut({
  idToken: idToken
});
```

```javascript
// In this case, the access token is stored under the 'myAccessToken' key
var accessToken = await authClient.tokenManager.get('myAccessToken');
authClient.signOut({
  accessToken: accessToken
});
```

### `closeSession()`

> :warning: This method requires access to [third party cookies](#third-party-cookies) <br>
> :hourglass: async

Signs the user out of their current [Okta session](https://developer.okta.com/docs/api/resources/sessions) and clears all tokens stored locally in the `TokenManager`. This method is an XHR-based alternative to [signOut](#signout), which will redirect to Okta before returning to your application. Here are some points to consider when using this method:

* Executes in the background. The user will see not any change to `window.location`.
* The method will fail to sign the user out if 3rd-party cookies are blocked by the browser.
* Does not revoke the access token. It is strongly recommended to call [revokeAccessToken](#revokeaccesstokenaccesstoken) before calling this method
* It is recommended (but not required) for the app to call `window.location.reload()` after the `XHR` method completes to ensure your app is properly re-initialized in an unauthenticated state.
* For more information, see [Close Current Session](https://developer.okta.com/docs/reference/api/sessions/#close-current-session) in the Session API documentation.

```javascript
await authClient.revokeAccessToken(); // strongly recommended
authClient.closeSession()
  .then(() => {
    window.location.reload(); // optional
  })
  .catch(e => {
    if (e.xhr && e.xhr.status === 429) {
      // Too many requests
    }
  })
```

### `revokeAccessToken(accessToken)`

> :hourglass: async

Revokes the access token for this application so it can no longer be used to authenticate API requests. The `accessToken` parameter is optional. By default, `revokeAccessToken` will look for a token object named `accessToken` within the `TokenManager`. If you have stored the access token object in a different location, you should retrieve it first and then pass it here. Returns a promise that resolves when the operation has completed. This method will succeed even if the access token has already been revoked or removed.

### `revokeRefreshToken(refreshToken)`

> :hourglass: async

Revokes the refresh token (if any) for this application so it can no longer be used to mint new tokens. The `refreshToken` parameter is optional. By default, `revokeRefreshToken` will look for a token object named `refreshToken` within the `TokenManager`. If you have stored the refresh token object in a different location, you should retrieve it first and then pass it here. Returns a promise that resolves when the operation has completed. This method will succeed even if the refresh token has already been revoked or removed.

### `forgotPassword(options)`

See [authn API](docs/authn.md#forgotpasswordoptions).

### `unlockAccount(options)`

See [authn API](docs/authn.md#unlockaccountoptions).

### `verifyRecoveryToken(options)`

See [authn API](docs/authn.md#verifyrecoverytokenoptions).

### `webfinger(options)`

> :hourglass: async

Calls the [Webfinger](https://tools.ietf.org/html/rfc7033) API and gets a response.

* `resource` - URI that identifies the entity whose information is sought, currently only acct scheme is supported (e.g acct:dade.murphy@example.com)
* `rel` - Optional parameter to request only a subset of the information that would otherwise be returned without the "rel" parameter

```javascript
authClient.webfinger({
  resource: 'acct:john.joe@example.com',
  rel: 'okta:idp'
})
.then(function(res) {
  // use the webfinger response to select an idp
})
.catch(function(err) {
  console.error(err);
});
```

### `fingerprint(options)`

> :hourglass: async

Creates a browser fingerprint. See [Primary authentication with device fingerprint](https://developer.okta.com/docs/reference/api/authn/#primary-authentication-with-device-fingerprinting) for more information.

* `timeout` - Time in ms until the operation times out. Defaults to `15000`.

```javascript
authClient.fingerprint()
.then(function(fingerprint) {
  // Do something with the fingerprint
})
.catch(function(err) {
  console.log(err);
})
```

### `isAuthenticated(options?)`

> :hourglass: async

Resolves with `authState.isAuthenticated` from non-pending [authState](#authstatemanager).

`options`
*  `expiredTokenBehavior`: `'renew'` (default) | `'remove'` | `'none'`
  * `'renew'` - attempt to renew token before `Promise` resolves
  * `'remove'` - removes token
  * `'none'` - neither renews or removes expired token

> NOTE: `tokenManager.autoRenew` and `tokenManager.autoRemove` determine the default value for `expiredTokenBehavior`

### `getUser()`

> :hourglass: async

Alias method of [token.getUserInfo](#tokengetuserinfoaccesstokenobject-idtokenobject).

### `getIdToken()`

Returns the id token string retrieved from [authState](#authstatemanager) if it exists.

### `getAccessToken()`

Returns the access token string retrieved from [authState](#authstatemanager) if it exists.

### `storeTokensFromRedirect()`

> :hourglass: async

Parses tokens from the redirect url and stores them.

### `setOriginalUri(uri?)`

Stores the current URL state before a redirect occurs.

### `getOriginalUri(state?)`

Returns the stored URI string stored by [setOriginal](#setoriginaluriuri). An OAuth `state` parameter is optional. If no value is passed for `state`, the URI is retrieved from isolated session storage and will work in a single browser. If a valid OAuth `state` is passed this method can return the URI stored from another browser tab.

### `removeOriginalUri()`

Removes the stored URI string stored by [setOriginal](#setoriginaluriuri) from storage.

#### `isLoginRedirect()`

> :link: web browser only <br>

Check `window.location` to verify if the app is in OAuth callback state or not. This function is synchronous and returns `true` or `false`.

```javascript
if (authClient.isLoginRedirect()) {
  // callback flow
  try {
    await authClient.handleLoginRedirect();
  } catch (e) {
    // log or display error details
  }
} else {
  // normal app flow
}
```

### `handleLoginRedirect(tokens?, originalUri?)`

> :link: web browser only <br>
> :hourglass: async

Stores passed in tokens or tokens from redirect url into storage, then redirect users back to the [originalUri](#setoriginaluriuri). When using `PKCE` authorization code flow, this method also exchanges authorization code for tokens. By default it calls `window.location.replace` for the redirection. The default behavior can be overrided by providing [options.restoreOriginalUri](#configuration-options). By default, [originalUri](#getoriginaluristate) will be retrieved from storage, but this can be overridden by passing a value fro `originalUri` to this function in the 2nd parameter.

> **Note:** `handleLoginRedirect` throws `OAuthError` or `AuthSdkError` in case there are errors during token retrieval.

### `setHeaders()`

Can set (or unset) request headers after construction.

```javascript
const authClient = new OktaAuth({
  issuer: 'https://{yourOktaDomain}',

  // headers can be set during construction
  headers: {
    foo: 'bar'
  }
});

// Headers can be set (or modified) after construction
authClient.setHeaders({
  foo: 'baz'
});

// Headers can be removed
authClient.setHeaders({
  foo: undefined
})
```

### `tx.resume()`

See [authn API](docs/authn.md#txresume).

### `tx.exists()`

See [authn API](docs/authn.md#txexists).

### `transaction.status`

See [authn API](docs/authn.md#transactionstatus).

### `session`

#### `session.setCookieAndRedirect(sessionToken, redirectUri)`

See [authn API](docs/authn.md#sessionsetcookieandredirectsessiontoken-redirecturi).

#### `session.exists()`

> :link: web browser only <br>
> :warning: This method requires access to [third party cookies] <br>(#third-party-cookies)
> :hourglass: async

Returns a promise that resolves with `true` if there is an existing Okta [session](https://developer.okta.com/docs/api/resources/sessions#example), or `false` if not.

```javascript
authClient.session.exists()
.then(function(exists) {
  if (exists) {
    // logged in
  } else {
    // not logged in
  }
});
```

#### `session.get()`

> :link: web browser only <br>
> :warning: This method requires access to [third party cookies] <br>(#third-party-cookies)
> :hourglass: async

Gets the active [session](https://developer.okta.com/docs/api/resources/sessions#example).

```javascript
authClient.session.get()
.then(function(session) {
  // logged in
})
.catch(function(err) {
  // not logged in
});
```

#### `session.refresh()`

> :link: web browser only <br>
> :warning: This method requires access to [third party cookies] <br>(#third-party-cookies)
> :hourglass: async

Refresh the current session by extending its lifetime. This can be used as a keep-alive operation.

```javascript
authClient.session.refresh()
.then(function(session) {
  // existing session is now refreshed
})
.catch(function(err) {
  // there was a problem refreshing (the user may not have an existing session)
});
```

### `idx`

See detail in [IDX README](docs/idx.md)

### `token`

#### Authorize options

The following configuration options can be included in `token.getWithoutPrompt`, `token.getWithPopup`, or `token.getWithRedirect`. If an option with the same name is accepted in the constructor, passing the option to one of these methods will override the previously set value.

| Options | Description |
| :-------: | ----------|
| `sessionToken` | Specify an Okta sessionToken to skip reauthentication when the user already authenticated using the Authentication Flow. |
| `responseType` | Specify the [response type](https://developer.okta.com/docs/api/resources/oidc#request-parameters) for OIDC authentication when using the [Implicit OAuth Flow](#implicit-oauth-20-flow). The default value is `['token', 'id_token']` which will request both an access token and ID token. If `pkce` is `true`, both the access and ID token will be requested and this option will be ignored. |
| `scopes` | Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`. For a list of available scopes, see [Scopes and Claims](https://developer.okta.com/docs/api/resources/oidc#access-token-scopes-and-claims). |
| `state` | A string that will be passed to `/authorize` endpoint and returned in the OAuth response. The value is used to validate the OAuth response and prevent cross-site request forgery (CSRF). The `state` value passed to [getWithRedirect](#tokengetwithredirectoptions) will be returned along with any requested tokens from [parseFromUrl](#tokenparsefromurloptions). Your app can use this string to perform additional validation and/or pass information from the login page. Defaults to a random string. |
| `nonce` | Specify a nonce that will be validated in an `id_token`. This is usually only provided during redirect flows to obtain an authorization code that will be exchanged for an `id_token`. Defaults to a random string. |
| `idp` | Identity provider to use if there is no Okta Session. |
| `idpScope` | A space delimited list of scopes to be provided to the Social Identity Provider when performing [Social Login][social-login] These scopes are used in addition to the scopes already configured on the Identity Provider. |
| `display` | The display parameter to be passed to the Social Identity Provider when performing [Social Login][social-login]. |
| `prompt` | Determines whether the Okta login will be displayed on failure. Use `none` to prevent this behavior. Valid values: `none`, `consent`, `login`, or `consent login`. See [Parameter details](https://developer.okta.com/docs/reference/api/oidc/#parameter-details) for more information. |
| `maxAge` | Allowable elapsed time, in seconds, since the last time the end user was actively authenticated by Okta. |
| `loginHint` | A username to prepopulate if prompting for authentication. |

For more details, see Okta's [Authorize Request API](https://developer.okta.com/docs/api/resources/oidc#request-parameters).

##### Example

```javascript
authClient.token.getWithoutPrompt({
  sessionToken: '00p8RhRDCh_8NxIin-wtF5M6ofFtRhfKWGBAbd2WmE',
  scopes: [
    'openid',
    'email',
    'profile'
  ],
  state: '8rFzn3MH5q',
  nonce: '51GePTswrm',
  // Use a custom IdP for social authentication
  idp: '0oa62b57p7c8PaGpU0h7'
 })
.then(function(res) {
  var tokens = res.tokens;

  // Do something with tokens, such as
  authClient.tokenManager.setTokens(tokens);
})
.catch(function(err) {
  // handle OAuthError or AuthSdkError
});
```

#### `token.getWithoutPrompt(options)`

> :link: web browser only <br>
> :warning: This method requires access to [third party cookies](#third-party-cookies) <br>
> :hourglass: async

When you've obtained a sessionToken from the authorization flows, or a session already exists, you can obtain a token or tokens without prompting the user to log in.

* `options` - See [Authorize options](#authorize-options)

```javascript
authClient.token.getWithoutPrompt({
  responseType: 'id_token', // or array of types
  sessionToken: 'testSessionToken' // optional if the user has an existing Okta session
})
.then(function(res) {
  var tokens = res.tokens;

  // Do something with tokens, such as
  authClient.tokenManager.setTokens(tokens);
})
.catch(function(err) {
  // handle OAuthError or AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
});
```

#### `token.getWithPopup(options)`

> :link: web browser only <br>
> :hourglass: async

Create token with a popup.

* `options` - See [Authorize options](#authorize-options)

```javascript
authClient.token.getWithPopup(options)
.then(function(res) {
  var tokens = res.tokens;

  // Do something with tokens, such as
  authClient.tokenManager.setTokens(tokens);
})
.catch(function(err) {
  // handle OAuthError or AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
});
```

#### `token.getWithRedirect(options)`

> :link: web browser only <br>
> :hourglass: async

Create token using a redirect. After a successful authentication, the browser will be redirected to the configured [redirectUri](#configuration-options). The authorization code, access, or ID Tokens will be available as parameters appended to this URL. Values will be returned in either the search query or hash fragment portion of the URL depending on the [responseMode](#responsemode)

* `options` - See [Authorize options](#authorize-options)

```javascript
authClient.token.getWithRedirect({
  responseType: ['token', 'id_token'],
  state: 'any-string-you-want-to-pass-to-callback' // will be URI encoded
})
.catch(function(err) {
  // handle AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
});
```

#### `token.parseFromUrl(options)`

> :link: web browser only <br>
> :hourglass: async

Parses the authorization code, access, or ID Tokens from the URL after a successful authentication redirect. Values are parsed from either the search query or hash fragment portion of the URL depending on the [responseMode](#responsemode).

If an authorization code is present, it will be exchanged for token(s) by posting to the `tokenUrl` endpoint. 
> **Note:** Authorization code has a lifetime of one minute and can only be used once.

The ID token will be [verified and validated](https://github.com/okta/okta-auth-js#tokenverifyidtokenobject) before available for use.
In case access token is a part of OIDC flow response, its hash will be checked against ID token's `at_hash` claim.

The `state` string which was passed to `getWithRedirect` will be also be available on the response.

```javascript
authClient.token.parseFromUrl()
.then(function(res) {
  var state = res.state; // passed to getWithRedirect(), can be any string

  // manage token or tokens
  var tokens = res.tokens;

  // Do something with tokens, such as
  authClient.tokenManager.setTokens(tokens);
})
.catch(function(err) {
  // handle OAuthError
});
```

After reading values, this method will rewrite either the hash fragment or search query portion of the URL (depending on the [responseMode](#responsemode)) so that the code or tokens are no longer present or visible to the user. For this reason, it is recommended to use a dedicated route or path for the [redirectUri](#configuration-options) so that this URL rewrite does not interfere with other URL parameters which may be used by your application. A complete login flow will usually save the current URL before calling `getWithRedirect` and restore the URL after saving tokens from `parseFromUrl`.

```javascript
// On any page while unauthenticated. Begin login flow

// Save URL
sessionStorage.setItem('url', window.location.href);

// Redirect to Okta
authClient.token.getWithRedirect({
  responseType: 'token'
});
```

```javascript
// On callback (redirectUri) page
authClient.token.parseFromUrl()
.then(function(res) {
  // Save token
  authClient.tokenManager.setTokens(res.tokens);

  // Read saved URL from storage
  const url = sessionStorage.getItem('url');
  sessionStorage.removeItem('url');

  // Restore URL
  window.location.assign(url);
})
.catch(function(err) {
  // Handle OAuthError
});
```

#### `token.decode(idTokenString)`

Decode a raw ID Token

* `idTokenString` - an id_token JWT

```javascript
const decodedToken = authClient.token.decode('YOUR_ID_TOKEN_JWT');
console.log(decodedToken.header, decodedToken.payload, decodedToken.signature);
```

#### `token.renew(tokenToRenew)`

> :warning: This method requires access to [third party cookies](#third-party-cookies)
> :hourglass: async

Returns a new token if the Okta [session](https://developer.okta.com/docs/api/resources/sessions#example) is still valid.

* `tokenToRenew` - an access token or ID token previously provided by Okta. note: this is not the raw JWT

```javascript
// this token is provided by Okta via getWithoutPrompt, getWithPopup, and parseFromUrl
var tokenToRenew = {
  idToken: 'YOUR_ID_TOKEN_JWT',
  claims: { /* token claims */ },
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
  issuer: 'https://{yourOktaDomain}',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

authClient.token.renew(tokenToRenew)
.then(function(freshToken) {
  // manage freshToken
})
.catch(function(err) {
  // handle OAuthError
});
```

#### `token.getUserInfo(accessTokenObject, idTokenObject)`

> :hourglass: async

Retrieve the [details about a user](https://developer.okta.com/docs/api/resources/oidc#response-example-success).

* `accessTokenObject` - (optional) an access token returned by this library. **Note**: this is not the raw access token.
* `idTokenObject` - (optional) an ID token returned by this library. **Note**: this is not the raw ID token.

By default, if no parameters are passed, both the access token and ID token objects will be retrieved from the TokenManager. It is assumed that the access token is stored using the key "accessToken" and the ID token is stored under the key "idToken". If you have stored either token in a non-standard location, this logic can be skipped by passing the access and ID token objects directly.

```javascript
// access and ID tokens are retrieved automatically from the TokenManager
authClient.token.getUserInfo()
.then(function(user) {
  // user has details about the user
})
.catch(function(err) {
  // handle OAuthError or AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
});
```

```javascript
// In this example, the access token is stored under the key 'myAccessToken', the ID token is stored under the key "myIdToken"
Promise.all([
  authClient.tokenManager.get('myAccessToken'),
  authClient.tokenManager.get('myIdToken')
])
.then(([accessTokenObject, idTokenObject]) => {
  return authClient.token.getUserInfo(accessTokenObject, idTokenObject);
})
.then(function(user) {
  // user has details about the user
})
.catch((err) => {
  // handle AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
});
```

#### `token.verify(idTokenObject)`

> :hourglass: async

Manually verify the validity of an ID token's claims and check the signature on browsers that support web cryptography.

> **Note:** Token validation occurs automatically when tokens are returned via `getWithoutPrompt`, `getWithPopup`, and `getWithRedirect`.

* `idTokenObject` - an ID token returned by this library. note: this is not the raw ID token JWT
* `validationOptions` - Optional object to assert ID token claim values. Defaults to the configuration passed in during client instantiation.

```javascript
var validationOptions = {
  issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}'
}

authClient.token.verify(idTokenObject, validationOptions)
.then(function() {
  // the idToken is valid
})
.catch(function(err) {
  // handle AuthSdkError
});
```

#### `token.isLoginRedirect`

> :link: web browser only <br>
> :warning: Deprecated, this method will be removed in next major release, use [sdk.isLoginRedirect](#isloginredirect) instead.

#### `token.prepareTokenParams`

Returns a `TokenParams` object. If `PKCE` is enabled, this object will contain values for `codeVerifier`, `codeChallenge` and `codeChallengeMethod`.

#### `token.exchangeCodeForTokens`

Used internally to perform the final step of the `PKCE` authorization code flow. Accepts a `TokenParams` object which should contain a `codeVerifier` and an `authorizationCode`.

### `tokenManager` API

#### `tokenManager.add(key, token)`

After receiving an `access_token` or `id_token`, add it to the `tokenManager` to manage token expiration and renew operations. When a token is added to the `tokenManager`, it is automatically renewed when it expires.

* `key` - Unique key to store the token in the `tokenManager`. This is used later when you want to get, delete, or renew the token.
* `token` - Token object that will be added

```javascript
authClient.token.getWithPopup()
.then(function(res) {
  authClient.tokenManager.add('idToken', res.tokens.idToken);
});
```

#### `tokenManager.get(key)`

> :hourglass: async

Get a token that you have previously added to the `tokenManager` with the given `key`. The token object will be returned if it exists in storage. Tokens will be removed from storage if they have expired and `autoRenew` is false or if there was an error while renewing the token. The `tokenManager` will emit a `removed` event when tokens are removed.

* `key` - Key for the token you want to get

```javascript
authClient.tokenManager.get('idToken')
.then(function(token) {
  if (token && !authClient.tokenManager.hasExpired(token)) {
    // Token is valid
    console.log(token);
  } else {
    // Token has been removed due to expiration or error while renewing
  }
})
.catch(function(err) {
  // handle OAuthError or AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
  console.error(err);
});
```

#### `tokenManager.getTokens()`

> :hourglass: async

Returns storage key agnostic tokens set for available tokens from storage. It returns empty object (`{}`) if no token is in storage.

```javascript
authClient.tokenManager.getTokens()
  .then(({ accessToken, idToken }) => {
    // handle accessToken and idToken
  });
```

#### `tokenManager.setTokens(tokens)`

Adds storage key agnostic tokens to storage. It uses default token storage keys (`idToken`, `accessToken`) in storage.

#### `tokenManager.hasExpired(token)`

A synchronous method which returns `true` if the token has expired. The `tokenManager` will automatically remove expired tokens in the background. However, when the app first loads this background process may not have completed, so there is a chance that an expired token may exist in storage. This method can be called to avoid this potential race condition.

#### `tokenManager.remove(key)`

Remove a token from the `tokenManager` with the given `key`.

* `key` - Key for the token you want to remove

```javascript
authClient.tokenManager.remove('idToken');
```

#### `tokenManager.clear()`

Remove all tokens from the `tokenManager`.

```javascript
authClient.tokenManager.clear();
```

#### `tokenManager.clearPendingRemoveTokens()`

Remove all tokens with `pendingRemove` flags. This method is called within `tokenManager.start()` by default, you can opt-out of the default behaviour by setting `tokenManager.clearPendingRemoveTokens` option to `false`.

#### `tokenManager.renew(key)`

> :hourglass: async

Manually renew a token before it expires and update the stored value.

* `key` - Key for the token you want to renew

```javascript
// Because the renew() method is async, you can wait for it to complete
// by using the returned Promise:
authClient.tokenManager.renew('idToken')
.then(function (newToken) {
  console.log(newToken);
});

// Alternatively, you can subscribe to the 'renewed' event:
authClient.tokenManager.on('renewed', function (key, newToken, oldToken) {
  console.log(newToken);
});
authClient.tokenManager.renew('idToken');
```

#### `tokenManager.on(event, callback[, context])`

Subscribe to an event published by the `tokenManager`.

* `event` - Event to subscribe to. Possible events are:
  * `added` - Fired when a new token has been added or updated (regardless of whether or not the token value was changed).
  * `expired` - Fired before a token is set to expire (using `expireEarlySeconds` option, 30 seconds by default). If `autoRenew` option is set to true, a listener will be attached to this event and an attempt will be made to renew the token when the event fires.
  * `error` - Fired when a token renew attempt has failed. This is a permanent error, and the token will be removed from storage.
  * `renewed` - Fired when a token has been renewed by the `tokenManager`, either via the `autoRenew` process or as a result of calling `tokenManager.renew`
  * `removed` - Fired when a token is removed from storage as a result of renew failure, or a call to `tokenManager.remove`. (This event will not fire from `tokenManager.clear`)
* `callback` - Function to call when the event is triggered
* `context` - Optional context to bind the callback to

```javascript
// Triggered when a token has expired
authClient.tokenManager.on('expired', function (key, expiredToken) {
  console.log('Token with key', key, ' has expired:');
  console.log(expiredToken);
});
// Triggered when a token has been renewed
authClient.tokenManager.on('renewed', function (key, newToken, oldToken) {
  console.log('Token with key', key, 'has been renewed');
  console.log('Old token:', oldToken);
  console.log('New token:', newToken);
});
// Triggered when an OAuthError is returned via the API (typically during token renew)
authClient.tokenManager.on('error', function (err) {
  console.log('TokenManager error:', err);
  // err.name
  // err.message
  // err.errorCode
  // err.errorSummary
  // err.tokenKey
  // err.accessToken
});
```

#### `tokenManager.off(event[, callback])`

Unsubscribe from `tokenManager` events. If no callback is provided, unsubscribes all listeners from the event.

* `event` - Event to unsubscribe from
* `callback` - Optional callback that was used to subscribe to the event

```javascript
authClient.tokenManager.off('renewed');
authClient.tokenManager.off('renewed', myRenewedCallback);
```

### `authStateManager`

`AuthStateManager` evaluates and emits `AuthState` based on the events from `TokenManager` for downstream clients to consume.

The emitted `AuthState` object includes:

* `isAuthenticated`: true if the user is considered authenticated. Normally this is true if both an idToken and an accessToken are present in the tokenManager, but this behavior can be overridden if you passed a [transformAuthState](#transformauthstate) callback in the [configuration](#configuration-reference).
* `accessToken`: the JWT accessToken for the currently authenticated user (if provided by the scopes).
* `idToken`: the JWT idToken for the currently authenticated user (if provided by the scopes).
* `error`: contains the error returned if an error occurs in the `authState` evaluation process.

Subscribes to `authStateChange` event:

```javascript
authClient.authStateManager.subscribe((authState) => {
  // handle the latest evaluated authState, like integrate with client framework's state management store
});
```

#### `authStateManager.getAuthState()`

Gets latest evaluated `authState` from the `authStateManager`. The `authState` (a unique new object) is re-evaluated when `authStateManager.updateAuthState()` is called. If `updateAuthState` has not been called, or it has not finished calculating an initial state, `getAuthState` will return `null`.

#### `authStateManager.getPreviousAuthState()`

Gets the previous evaluated `authState` from the `authStateManager`. This state can be used to tell when the new authState is evaluated. For example, the `authState` is evaluated duing app initialization if the `previousAuthState` is `null`, and the `authState` is evaluated during tokens auto renew process if the `previousAuthState` exists.

#### `authStateManager.updateAuthState()`

Produces a unique `authState` object and emits an `authStateChange` event. The [authState](#authstatemanager) object contains tokens from the `tokenManager` and a calculated `isAuthenticated` value. By default, `authState.isAuthenticated` will be true if both `idToken` and `accessToken` are present. This logic can be customized by defining a custom [transformAuthState](#transformauthstate) function.

The app needs call this method to call this method to initial the [authState](#authstatemanager).

```javascript
authClient.authStateManager.subscribe(authState => {
  // handle emitted latest authState
});
if (!authClient.isLoginRedirect()) {
  // Trigger an initial authState change event when the app startup
  authClient.authStateManager.updateAuthState();
}
```

#### `authStateManager.subscribe(handler)`

Subscribes a callback that will be called when the `authStateChange` event happens.

#### `authStateManager.unsubscribe(handler?)`

Unsubscribes callback for `authStateChange` event. It will unregister all handlers if no callback handler is provided.

## Node JS and React Native Usage

You can use this library on the server side in your Node application or mobile client side in React Native environment. Some methods are only available in a web browser environment. These methods are marked in the README with this note:

> :link: web browser only <br>

To include this library in your project, you can follow the instructions in the [Getting started](#getting-started) section.

### Configuration

You only need to set the `issuer` for your Okta Domain:

```javascript
var OktaAuth = require('@okta/okta-auth-js').OktaAuth;

var config = {
  // The URL for your Okta organization
  issuer: 'https://{yourOktaDomain}'
};

var authClient = new OktaAuth(config);
```

### `http`

The `http` API allows customization of network requests made by internal HTTP agents.

#### `http.setRequestHeader`

Sets the value for a request header after [configuration options](#configuration-options) have already been processed. Headers can also be customized by setting a `headers` object in the [configuration](#configuration-options) object.

### Supported APIs

Since the Node library can be used only for the Authentication flow, it implements only a subset of okta-auth-js APIs:

* [signIn](#signinoptions)
* [forgotPassword](#forgotpasswordoptions)
* [unlockAccount](#unlockaccountoptions)
* [verifyRecoveryToken](#verifyrecoverytokenoptions)
* [tx.resume](#txresume)
* [tx.exists](#txexists)
* [transaction.status](#transactionstatus)
  * [LOCKED_OUT](#locked_out)
  * [PASSWORD_EXPIRED](#password_expired)
  * [PASSWORD_RESET](#password_reset)
  * [PASSWORD_WARN](#password_warn)
  * [RECOVERY](#recovery)
  * [RECOVERY_CHALLENGE](#recovery_challenge)
  * [MFA_ENROLL](#mfa_enroll)
  * [MFA_ENROLL_ACTIVATE](#mfa_enroll_activate)
  * [MFA_REQUIRED](#mfa_required)
  * [MFA_CHALLENGE](#mfa_challenge)
  * [SUCCESS](#success)
* [idx](#idx)

The main difference is that the Node library does **not** have a `session.setCookieAndRedirect` function, so you will have to redirect by yourself (for example using `res.redirect('https://www.yoursuccesspage.com')`).

The `SUCCESS` transaction will still include a `sessionToken` which you can use with the session APIs: <https://github.com/okta/okta-sdk-nodejs#sessions.>

## Building the SDK

In most cases, you won't need to build the SDK from source. If you want to build it yourself, you'll need to follow these steps:

```bash
# Clone the repo
git clone https://github.com/okta/okta-auth-js.git

# Navigate into the new `okta-auth-js` filder
cd okta-auth-js

# Install Okta node dependencies and SDK will be built under `build`
yarn install
```

## Linking the built SDK locally

```bash
# navigate to the `build` folder
cd build

# create a link to the built package
yarn link

# navigate to your other project which has "@okta/okta-auth-js" as a dependency and create link
cd ../../other
yarn link @okta/okta-auth-js
```

### Build and Test Commands

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `yarn clean`          | Removes installed dependencies and build outputs |
| `yarn install`        | Install dependencies            |
| `yarn build`          | Build the SDK with a sourcemap  |
| `yarn start`          | Start internal test app         |
| `yarn lint`           | Run eslint linting              |
| `yarn test:unit`      | Run only unit tests             |
| `yarn test:e2e`       | Run only E2E (end-to-end) tests |
| `yarn test`           | Run all tests                   |

#### Test Environment

Before running the E2E tests, you will need to setup a test environment. See [test/e2e/README](test/e2e/README.md) for more information.

#### Test App

We have implemented a small SPA app, located at `./test/app/` which is used internally as a test harness for the E2E tests. The app can be run manually using `yarn start`. This will start a webpack dev server and open a new browser window at `http://localhost:8080`. The app provides a high level of feedback and configurability which make it useful as a tool for troubleshooting and manual testing scenarios. See [test/app/README](test/app/README.md) for more information on the test app.

> :warning: Because this test app is set up to dynamically change configuration and leak internal information, users should not use source in the test app as the basis for their own applications. Instead, use the example usage outlined elsewhere in this README.

## Migrating from previous versions

The [CHANGELOG](CHANGELOG.md) contains details for all changes and links to the original PR.

### From 5.x to 6.x

* All async [IDX API](docs/idx.md) methods will either resolve with an IDX transaction object or throw an exception. In the previous version some exceptions were caught and returned as the `error` property on an IDX transaction object.

### From 4.x to 5.x

* Token auto renew requires [running OktaAuth as a service](#running-as-a-service). To start the service, call [start()](#start). `start` will also call [updateAuthState](#authstatemanagerupdateauthstate) to set an initial [AuthState](#authstatemanager)
* [getAuthState](#authstatemanagergetauthstate) will return `null` until an [AuthState](#authstatemanager) has been calculated.
* `isPending` has been removed from [AuthState](#authstatemanager).

### From 3.x to 4.x

* Now using named exports. You should change code like

```javascript
// 3.x used default export
import OktaAuth from '@okta/okta-auth-js'
```

to

```javascript
// 4.x uses named exports
import { OktaAuth } from '@okta/okta-auth-js'
```

If using CommonJS, change

```javascript
// In 3.x module.exports was the OktaAuth object
const OktaAuth = require('@okta/okta-auth-js');
```

to

```javascript
// In 4.x module.exports has a property named 'OktaAauth'
const OktaAuth = require('@okta/okta-auth-js').OktaAuth;
```

* For Typescript users: definitions for types in this library are now included. If you were providing your own definitions for `@okta/okta-auth-js` you should remove these in favor of the types exported by this library.

* `onSessionExpired` option has been removed. [TokenManager events](#tokenmanageronevent-callback-context) can be used to detect and handle token renewal errors.

### From 2.x to 3.x

* Option `issuer` is [required](README.md#configuration-reference). Option `url` has been deprecated and is no longer used.

* The object returned from `token.parseFromUrl()` is no longer an array containing token objects. It is now an object with a property called `tokens` which is a dictionary containing token objects.

* New behavior for [signOut()](README.md#signout).

* The default `responseMode` for PKCE flow is now `query`.

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](CONTRIBUTING.md) to understand how to structure a contribution.
