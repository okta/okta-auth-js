[<img src="https://devforum.okta.com/uploads/oktadev/original/1X/bf54a16b5fda189e4ad2706fb57cbb7a1e5b8deb.png" align="right" width="256px"/>](https://devforum.okta.com/)

[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)](https://devforum.okta.com)
[![Build Status](https://travis-ci.org/okta/okta-auth-js.svg?branch=master)](https://travis-ci.org/okta/okta-auth-js)
[![npm version](https://img.shields.io/npm/v/@okta/okta-auth-js.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-auth-js)

# Okta Auth JavaScript SDK

* [Release status](#release-status)
* [Need help?](#need-help)
* [Getting started](#getting-started)
* [Usage guide](#usage-guide)
* [Configuration reference](#configuration-reference)
* [API Reference](#api-reference)
* [Building the SDK](#building-the-sdk)
* [Contributing](#contributing)

The Okta Auth JavaScript SDK builds on top of our [Authentication API](https://developer.okta.com/docs/api/resources/authn) and [OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc) to enable you to create a fully branded sign-in experience using JavaScript.

You can learn more on the [Okta + JavaScript][lang-landing] page in our documentation.

## Release status

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/).

:heavy_check_mark: The current stable major version series is: `2.x`

| Version   | Status                           |
| -------   | -------------------------------- |
| `2.x`     | :heavy_check_mark: Stable        |
| `1.x`     | :warning: Retiring on 2019-05-31 |
| `0.x`     | :x: Retired                      |

The latest release can always be found on the [releases page][github-releases].

## Need help?

If you run into problems using the SDK, you can:

* Ask questions on the [Okta Developer Forums][devforum]
* Post [issues][github-issues] here on GitHub (for code errors)

## Getting started

Installing the Authentication SDK is simple. You can include it in your project via our npm package, [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js).

You'll also need:

* An Okta account, called an _organization_ (sign up for a free [developer organization](https://developer.okta.com/signup) if you need one)

### Using the npm module

Using our npm module is a good choice if:

* You have a build system in place where you manage dependencies with npm.
* You do not want to load scripts directly from third party sites.

To install [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js):

```bash
# Run this command in your project root folder.
npm install @okta/okta-auth-js --save
```

After running `npm install`, the minified auth client will be installed to `node_modules/@okta/okta-auth-js/dist`. You can copy the `dist` contents to a publicly hosted directory. However, if you're using a bundler like [Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/), you can simply import the module using CommonJS.

```javascript
var OktaAuth = require('@okta/okta-auth-js');
var authClient = new OktaAuth(/* configOptions */);
```

If you're using a bundler like webpack or browserify, we have implementations for jquery and reqwest included. To use them, import the SDK like this:

```javascript
// reqwest
var OktaAuth = require('@okta/okta-auth-js/reqwest');

// jquery
var OktaAuth = require('@okta/okta-auth-js/jquery');
```

## Usage guide

For an overview of the client's features and authentication flows, check out [our developer docs](https://developer.okta.com/docs/guides/okta_auth_sdk). There, you will learn how to use the Auth SDK on a simple static page to:

* Retrieve and store an OpenID Connect (OIDC) token
* Get an Okta session

You can also browse the full [API reference documentation](#api-reference).

## Configuration reference

If you are using this SDK to implement an OIDC flow, the only required configuration option is `issuer`:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default'
};

var authClient = new OktaAuth(config);
```

If you’re using this SDK only for communicating with the [Authentication API](https://developer.okta.com/docs/api/resources/authn), you instead need to set the `url` for your Okta Domain:

```javascript
var config = {
  // The URL for your Okta organization
  url: 'https://{yourOktaDomain}'
};

var authClient = new OktaAuth(config);
```

### [OpenID Connect](https://developer.okta.com/docs/api/resources/oidc) options

These configuration options can be included when instantiating Okta Auth JS (`new OktaAuth(config)`) or in `token.getWithoutPrompt`, `token.getWithPopup`, or `token.getWithRedirect` (unless noted otherwise). If included in both, the value passed in the method takes priority.

#### The `tokenManager`

**Important:** This configuration option can be included **only** when instantiating Okta Auth JS.

Specify the type of storage for tokens. Defaults to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and will fall back to [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), and/or [cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) if not the previous type is not available.

```javascript

var config = {
  url: 'https://{yourOktaDomain}',
  tokenManager: {
    storage: 'sessionStorage'
  }
};

var authClient = new OktaAuth(config);
```

By default, the `tokenManager` will attempt to renew expired tokens. When an expired token is requested by the `tokenManager.get()` method, a renewal request is executed to update the token. If you wish to manually control token renewal, set `autoRenew` to false to disable this feature. You can listen to  [`expired`](#tokenmanageronevent-callback-context) events to know when the token has expired.

```javascript
tokenManager: {
  autoRenew: false
}
```

#### Additional Options

| Option | Description |
| -------------- | ------------ |
| `issuer`       | Specify a custom issuer to perform the OIDC flow. Defaults to the base url parameter if not provided. |
| `clientId`     | Client Id pre-registered with Okta for the OIDC authentication flow. |
| `redirectUri`  | The url that is redirected to when using `token.getWithRedirect`. This must be pre-registered as part of client registration. If no `redirectUri` is provided, defaults to the current origin. |
| `authorizeUrl` | Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize". |
| `userinfoUrl`  | Specify a custom userinfoUrl. Defaults to the issuer plus "/v1/userinfo". |
| `ignoreSignature` | ID token signatures are validated by default when `token.getWithoutPrompt`, `token.getWithPopup`,  `token.getWithRedirect`, and `token.verify` are called. To disable ID token signature validation for these methods, set this value to `true`. |
| | This option should be used only for browser support and testing purposes. |

##### Example Client

```javascript
var config = {
  url: 'https://{yourOktaDomain}',

  // Optional config
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',

  // Override the default authorize and userinfo URLs
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/default/v1/authorize',
  userinfoUrl: 'https://{yourOktaDomain}/oauth2/default/v1/userinfo',

  // TokenManager config
  tokenManager: {
    storage: 'sessionStorage'
  }
};

var authClient = new OktaAuth(config);
```

### Optional configuration options

#### `ajaxRequest`

The ajax request implementation. By default, this is implemented using [reqwest](https://github.com/ded/reqwest). To provide your own request library, implement the following interface:

  1. Must accept:
      * method (http method)
      * url (target url)
      * args (object containing headers and data)
  2. Must return a Promise that resolves with a raw XMLHttpRequest response

```javascript
var config = {
  url: 'https://{yourOktaDomain}',
  ajaxRequest: function(method, url, args) {
    // args is in the form:
    // {
    //   headers: {
    //     headerName: headerValue
    //   },
    //   data: postBodyData
    // }
    return Promise.resolve(/* a raw XMLHttpRequest response */);
  }
}
```

## API Reference

* [signIn](#signinoptions)
* [signOut](#signout)
* [forgotPassword](#forgotpasswordoptions)
* [unlockAccount](#unlockaccountoptions)
* [verifyRecoveryToken](#verifyrecoverytokenoptions)
* [webfinger](#webfingeroptions)
* [fingerprint](#fingerprintoptions)
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
* [session](#session)
  * [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi)
  * [session.exists](#sessionexists)
  * [session.get](#sessionget)
  * [session.refresh](#sessionrefresh)
* [token](#token)
  * [token.getWithoutPrompt](#tokengetwithoutpromptoauthoptions)
  * [token.getWithPopup](#tokengetwithpopupoauthoptions)
  * [token.getWithRedirect](#tokengetwithredirectoptions)
  * [token.parseFromUrl](#tokenparsefromurloptions)
  * [token.decode](#tokendecodeidtokenstring)
  * [token.renew](#tokenrenewtokentorenew)
  * [token.getUserInfo](#tokengetuserinfoaccesstokenobject)
  * [token.verify](#tokenverifyidtokenobject)
* [tokenManager](#tokenmanager)
  * [tokenManager.add](#tokenmanageraddkey-token)
  * [tokenManager.get](#tokenmanagergetkey)
  * [tokenManager.remove](#tokenmanagerremovekey)
  * [tokenManager.clear](#tokenmanagerclear)
  * [tokenManager.renew](#tokenmanagerrenewkey)
  * [tokenManager.on](#tokenmanageronevent-callback-context)
  * [tokenManager.off](#tokenmanageroffevent-callback)

------

### `signIn(options)`

The goal of an authentication flow is to [set an Okta session cookie on the user's browser](https://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-by-visiting-a-session-redirect-link) or [retrieve an `id_token` or `access_token`](https://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-via-openid-connect-authorization-endpoint). The flow is started using `signIn`.

* `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
* `password` - The password of the user
* `sendFingerprint` - Enabling this will send a `X-Device-Fingerprint` header. Defaults to `false`

```javascript
authClient.signIn({
  username: 'some-username',
  password: 'some-password'
})
.then(function(transaction) {
  if (transaction.status === 'SUCCESS') {
    authClient.session.setCookieAndRedirect(transaction.sessionToken); // Sets a cookie on redirect
  } else {
    throw 'We cannot handle the ' + transaction.status + ' status';
  }
})
.fail(function(err) {
  console.error(err);
});
```

### `signOut()`

Signs the user out of their current Okta [session](https://developer.okta.com/docs/api/resources/sessions#example).

```javascript
authClient.signOut()
.then(function() {
  console.log('successfully logged out');
})
.fail(function(err) {
  console.error(err);
});
```

### `forgotPassword(options)`

Starts a [new password recovery transaction](https://developer.okta.com/docs/api/resources/authn#forgot-password) for a given user and issues a recovery token that can be used to reset a user’s password.

* `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
* `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
* `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

```javascript
authClient.forgotPassword({
  username: 'dade.murphy@example.com',
  factorType: 'SMS',
})
.then(function(transaction) {
  return transaction.verify({
    passCode: '123456' // The passCode from the SMS or CALL
  });
})
.then(function(transaction) {
  if (transaction.status === 'SUCCESS') {
    authClient.session.setCookieAndRedirect(transaction.sessionToken);
  } else {
    throw 'We cannot handle the ' + transaction.status + ' status';
  }
})
.fail(function(err) {
  console.error(err);
});
```

### `unlockAccount(options)`

Starts a [new unlock recovery transaction](https://developer.okta.com/docs/api/resources/authn#unlock-account) for a given user and issues a recovery token that can be used to unlock a user’s account.

* `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
* `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
* `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

```javascript
authClient.unlockAccount({
  username: 'dade.murphy@example.com',
  factorType: 'SMS',
})
.then(function(transaction) {
  return transaction.verify({
    passCode: '123456' // The passCode from the SMS
  });
})
.then(function(transaction) {
  if (transaction.status === 'SUCCESS') {
    authClient.session.setCookieAndRedirect(transaction.sessionToken);
  } else {
    throw 'We cannot handle the ' + transaction.status + ' status';
  }
})
.fail(function(err) {
  console.error(err);
});
```

### `verifyRecoveryToken(options)`

Validates a recovery token that was distributed to the end-user to continue the [recovery transaction](https://developer.okta.com/docs/api/resources/authn#verify-recovery-token).

* `recoveryToken` - Recovery token that was distributed to end-user via an out-of-band mechanism such as email

```javascript
authClient.verifyRecoveryToken({
  recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
})
.then(function(transaction) {
  if (transaction.status === 'SUCCESS') {
    authClient.session.setCookieAndRedirect(transaction.sessionToken);
  } else {
    throw 'We cannot handle the ' + transaction.status + ' status';
  }
})
.fail(function(err) {
  console.error(err);
});
```

### `webfinger(options)`

Calls the [Webfinger](https://tools.ietf.org/html/rfc7033) API and gets a response.

* `resource` - URI that identifies the entity whose information is sought, currently only acct scheme is supported (e.g acct:dade.murphy@example.com)
* `rel` - Optional parameter to request only a subset of the information that would otherwise be returned without the "rel" parameter
* `requestContext` - Optional parameter that provides Webfinger the context of that which the user is trying to access, such as the path of an app

```javascript
authClient.webfinger({
  resource: 'acct:john.joe@example.com',
  rel: 'okta:idp',
  requestContext: '/home/dropbox/0oa16630PzpWKeWrH0g4/121'
})
.then(function(res) {
  // use the webfinger response to select an idp
})
.fail(function(err) {
  console.error(err);
});
```

### `fingerprint(options)`

Creates a browser fingerprint.

* `timeout` - Time in ms until the operation times out. Defaults to `15000`.

```javascript
authClient.fingerprint()
.then(function(fingerprint) {
  // Do something with the fingerprint
})
.fail(function(err) {
  console.log(err);
})
```

### `tx.resume()`

Resumes an in-progress **transaction**. This is useful if a user navigates away from the login page before authentication is complete.

```javascript
var exists = authClient.tx.exists();
if (exists) {
  authClient.tx.resume()
  .then(function(transaction) {
    console.log('current status:', transaction.status);
  })
  .fail(function(err) {
    console.error(err);
  });
}
```

### `tx.exists()`

Check for a **transaction** to be resumed. This is synchronous and returns `true` or `false`.

```javascript
var exists = authClient.tx.exists();
if (exists) {
  console.log('a session exists');
} else {
  console.log('a session does not exist');
}
```

### `transaction.status`

When Auth Client methods resolve, they return a **transaction** object that encapsulates [the new state in the authentication flow](https://developer.okta.com/docs/api/resources/authn#transaction-model). This **transaction** contains metadata about the current state, and methods that can be used to progress to the next state.

![State Model Diagram](https://raw.githubusercontent.com/okta/okta.github.io/source/_source/_assets/img/auth-state-model.png "State Model Diagram")

#### Common methods

##### `cancel()`

Terminates the current auth flow.

```javascript
transaction.cancel()
.then(function() {
  // transaction canceled. You can now start another with authClient.signIn
});
```

##### `changePassword(options)`

[Changes](https://developer.okta.com/docs/api/resources/authn#reset-password) a user's password.

* `oldPassword` - User’s current password that is expired
* `newPassword` - New password for user

```javascript
transaction.changePassword({
  oldPassword: '0ldP4ssw0rd',
  newPassword: 'N3wP4ssw0rd'
});
```

##### `resetPassword(options)`

[Reset](https://developer.okta.com/docs/api/resources/authn#reset-password) a user's password.

* `newPassword` - New password for user

```javascript
transaction.resetPassword({
  newPassword: 'N3wP4ssw0rd'
});
```

##### `skip()`

Ignore the warning and continue.

```javascript
transaction.skip();
```

#### LOCKED_OUT

The user account is [locked](https://developer.okta.com/docs/api/resources/authn#show-lockout-failures); self-service unlock or admin unlock is required.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'LOCKED_OUT',
    unlock: function(options) { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

##### `unlock(options)`

[Unlock](https://developer.okta.com/docs/api/resources/authn#unlock-account) the user account.

* `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
* `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
* `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

```javascript
transaction.unlock({
  username: 'dade.murphy@example.com',
  factorType: 'EMAIL'
});
```

#### PASSWORD_EXPIRED

The user’s password was successfully validated but is [expired](https://developer.okta.com/docs/api/resources/authn#response-example-expired-password).

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'PASSWORD_EXPIRED',
    expiresAt: '2014-11-02T23:39:03.319Z',
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    },
    changePassword: function(options) { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

#### PASSWORD_RESET

The user successfully answered their recovery question and can set a new password.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'PASSWORD_EXPIRED',
    expiresAt: '2014-11-02T23:39:03.319Z',
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    },
    resetPassword: function(options) { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
```

</details>

#### PASSWORD_WARN

The user’s password was successfully validated but is about to expire and should be changed.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'PASSWORD_WARN',
    expiresAt: '2014-11-02T23:39:03.319Z',
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    },
    policy: {
      expiration:{
        passwordExpireDays: 0
      },
      complexity: {
        minLength: 8,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumber: 1,
        minSymbol: 0,
        excludeUsername: true
      },
      age:{
        minAgeMinutes:0,
        historyCount:0
      }
    },
    changePassword: function(options) { /* returns another transaction */ },
    skip: function() { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

#### RECOVERY

The user has requested a recovery token to reset their password or unlock their account.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'RECOVERY',
    expiresAt: '2014-11-02T23:39:03.319Z',
    recoveryType: 'PASSWORD', // or 'UNLOCK'
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      },
      recovery_question: {
        question: "Who's a major player in the cowboy scene?"
      }
    },
    answer: function(options) { /* returns another transaction */ },
    recovery: function(options) { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

##### `answer(options)`

* `answer` - [Answer](https://developer.okta.com/docs/api/resources/authn#answer-recovery-question) to user’s recovery question

```javascript
transaction.answer({
  answer: 'My favorite recovery question answer'
});
```

##### `recovery(options)`

* `recoveryToken` - [Recovery](https://developer.okta.com/docs/api/resources/authn#verify-recovery-token) token that was distributed to end-user via out-of-band mechanism such as email

```javascript
transaction.recovery({
  recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
});
```

#### RECOVERY_CHALLENGE

The user must verify the factor-specific recovery challenge.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'RECOVERY_CHALLENGE',
    expiresAt: '2014-11-02T23:39:03.319Z',
    recoveryType: 'PASSWORD', // or 'UNLOCK',
    factorType: 'EMAIL', // or 'SMS'
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    },
    verify: function(options) { /* returns another transaction */ },
    resend: function() { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

##### `verify(options)`

* `passCode` - OTP sent to device for [verification](https://developer.okta.com/docs/api/resources/authn#verify-sms-recovery-factor)

```javascript
transaction.verify({
  passCode: '615243'
});
```

##### `resend()`

[Resend](https://developer.okta.com/docs/api/resources/authn#resend-sms-recovery-challenge) the recovery email or text.

```javascript
transaction.resend();
```

#### MFA_ENROLL

When MFA is required, but a user isn’t enrolled in MFA, they must enroll in at least one factor.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'MFA_ENROLL',
    expiresAt: '2014-11-02T23:39:03.319Z',
    user: {
      id: '00ub0oNGTSWTBKOLGLNR',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    },
    factors: [{
      provider: 'OKTA',
      factorType: 'question',
      questions: function() { /* returns an array of possible questions */ },
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'OKTA',
      factorType: 'sms',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'OKTA',
      factorType: 'call',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'OKTA',
      factorType: 'push',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'OKTA',
      factorType: 'token:software:totp',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'GOOGLE',
      factorType: 'token:software:totp',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'YUBICO',
      factorType: 'token:hardware',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'RSA',
      factorType: 'token',
      enroll: function(options) { /* returns another transaction */ }
    }, {
      provider: 'SYMANTEC',
      factorType: 'token',
      enroll: function(options) { /* returns another transaction */ }
    }],
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

To enroll in a factor, select one from the factors array, then use the following methods.

```javascript
var factor = transaction.factors[/* index of the desired factor */];
```

##### `questions()`

List the available [questions](https://developer.okta.com/docs/api/resources/factors#list-security-questions) for the question factorType.

```javascript
var questionFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'question';
});

questionFactor.questions()
.then(function(questions) {
  // Display questions for the user to select from
});
```

##### `enroll(options)`

The enroll options depend on the desired factor.

###### [OKTA question](https://developer.okta.com/docs/api/resources/factors#enroll-okta-security-question-factor)

```javascript
var questionFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'question';
});

questionFactor.enroll({
  profile: {
    question: 'disliked_food', // all questions available using questionFactor.questions()
    answer: 'mayonnaise'
  }
});
```

###### [OKTA sms](https://developer.okta.com/docs/api/resources/factors#enroll-okta-sms-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'sms';
});

factor.enroll({
  profile: {
    phoneNumber: '+1-555-415-1337',
    updatePhone: true
  }
});

// The passCode sent to the phone is verified in MFA_ENROLL_ACTIVATE
```

###### [OKTA call](https://developer.okta.com/docs/api/resources/factors#enroll-okta-call-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'call';
});

factor.enroll({
  profile: {
    phoneNumber: '+1-555-415-1337',
    updatePhone: true
  }
});

// The passCode from the call is verified in MFA_ENROLL_ACTIVATE
```

###### [OKTA push](https://developer.okta.com/docs/api/resources/factors#enroll-okta-verify-push-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'push';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [OKTA token:software:totp](https://developer.okta.com/docs/api/resources/factors#enroll-okta-verify-totp-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'token:software:totp';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [GOOGLE token:software:totp](https://developer.okta.com/docs/api/resources/factors#enroll-google-authenticator-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'GOOGLE' && factor.factorType === 'token:software:totp';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [YUBICO token:hardware](https://developer.okta.com/docs/api/resources/factors#enroll-yubikey-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'YUBICO' && factor.factorType === 'token:hardware';
});

factor.enroll({
  passCode: 'cccccceukngdfgkukfctkcvfidnetljjiknckkcjulji'
});
```

###### [RSA token](https://developer.okta.com/docs/api/resources/factors#enroll-rsa-securid-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'RSA' && factor.factorType === 'token';
});

factor.enroll({
  passCode: '5275875498',
  profile: {
    credentialId: 'dade.murphy@example.com'
  }
});
```

###### [SYMANTEC token](https://developer.okta.com/docs/api/resources/factors#enroll-symantec-vip-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'SYMANTEC' && factor.factorType === 'token';
});

factor.enroll({
  passCode: '875498',
  nextPassCode: '678195',
  profile: {
    credentialId: 'VSMT14393584'
  }
});
```

#### MFA_ENROLL_ACTIVATE

The user must activate the factor to complete enrollment.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'MFA_ENROLL_ACTIVATE',
    expiresAt: '2014-11-02T23:39:03.319Z',
    factorResult: 'WAITING', // or 'TIMEOUT',
    user: {
      id: '00ugti3kwafWJBRIY0g3',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      },
    },
    factor: {
      id: 'opfh52xcuft3J4uZc0g3',
      provider: 'OKTA',
      factorType: 'push',
      profile: {},
      activation: {
        expiresAt: '2015-04-01T15:57:32.000Z',
        qrcode: {
          href: 'https://acme.okta.com/api/v1/users/00ugti3kwafWJBRIY0g3/factors/opfh52xcuft3J4uZc0g3/qr/00fukNElRS_Tz6k-CFhg3pH4KO2dj2guhmaapXWbc4',
          type: 'image/png'
        }
      }
    },
    resend: function() { /* returns another transaction */ },
    activate: function(options) { /* returns another transaction */ },
    poll: function() { /* returns another transaction */ },
    prev: function() { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

##### `resend()`

Send another OTP if user doesn’t receive the original activation SMS OTP.

```javascript
transaction.resend();
```

##### `activate(options)`

* `passCode` - OTP- sent to device for [activation](https://developer.okta.com/docs/api/resources/authn#activate-sms-factor)

```javascript
transaction.activate({
  passCode: '615243'
});
```

##### `poll()`

[Poll](https://developer.okta.com/docs/api/resources/authn#activate-push-factor) until factorResult is not WAITING. Throws AuthPollStopError if prev, resend, or cancel is called.

```javascript
transaction.poll();
```

##### `prev()`

End current factor enrollment and [return to](https://developer.okta.com/docs/api/resources/authn#previous-transaction-state) `MFA_ENROLL`.

```javascript
transaction.prev();
```

#### MFA_REQUIRED

The user must provide additional verification with a previously enrolled factor.
<details>
  <summary> <b>Example Response</b> </summary>

  ```javascript
  {
    status: 'MFA_REQUIRED',
    expiresAt: '2014-11-02T23:39:03.319Z',
    user: {
      id: '00ugti3kwafWJBRIY0g3',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      },
    },
    factors: [{
      id: 'ufsigasO4dVUPM5O40g3',
      provider: 'OKTA',
      factorType: 'question',
      profile: {
        question: 'disliked_food',
        questionText: 'What is the food you least liked as a child?'
      },
      verify: function(options) { /* returns another transaction */ }
    }, {
      id: 'opfhw7v2OnxKpftO40g3',
      provider: 'OKTA',
      factorType: 'push',
      profile: {
        credentialId: 'isaac@example.org',
        deviceType: 'SmartPhone_IPhone',
        keys: [
          {
            kty: 'PKIX',
            use: 'sig',
            kid: 'default',
            x5c: [
              'MIIBIjANBgkqhkiG9w0BAQEFBAOCAQ8AMIIBCgKCAQEAs4LfXaaQW6uIpkjoiKn2g9B6nNQDraLyC3XgHP5cvX/qaqry43SwyqjbQtwRkScosDHl59r0DX1V/3xBtBYwdo8rAdX3I5h6z8lW12xGjOkmb20TuAiy8wSmzchdm52kWodUb7OkMk6CgRJRSDVbC97eNcfKk0wmpxnCJWhC+AiSzRVmgkpgp8NanuMcpI/X+W5qeqWO0w3DGzv43FkrYtfSkvpDdO4EvDL8bWX1Ad7mBoNVLWErcNf/uI+r/jFpKHgjvx3iqs2Q7vcfY706Py1m91vT0vs4SWXwzVV6pAVjD/kumL+nXfzfzAHw+A2vb6J2w06Rj71bqUkC2b8TpQIDAQAB'
            ]
          }
        ],
        name: 'Isaac\'s iPhone',
        platform: 'IOS',
        version: '8.1.3'
      },
      verify: function() { /* returns another transaction */ }
    }, {
      id: 'smsigwDlH85L9FyQK0g3',
      provider: 'OKTA',
      factorType: 'sms',
      profile: {
        phoneNumber: '+1 XXX-XXX-3355'
      },
      verify: function() { /* returns another transaction */ }
    }, {
      id: 'ostigevBq2NObXmTh0g3',
      provider: 'OKTA',
      factorType: 'token:software:totp',
      profile: {
        credentialId: 'isaac@example.org'
      },
      verify: function() { /* returns another transaction */ }
    }, {
      id: 'uftigiEmYTPOmvqTS0g3',
      provider: 'GOOGLE',
      factorType: 'token:software:totp',
      profile: {
        credentialId: 'isaac@example.org'
      },
      verify: function() { /* returns another transaction */ }
    }],
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

  </details>

##### [Verify Factor](https://developer.okta.com/docs/api/resources/authn#verify-factor)

To verify a factor, select one from the factors array, then use the following methods.

```javascript
var factor = transaction.factors[/* index of the desired factor */];
```

###### [OKTA question](https://developer.okta.com/docs/api/resources/authn#verify-security-question-factor)

```javascript
var questionFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'question';
});

questionFactor.verify({
  answer: 'mayonnaise'
});
```

###### [OKTA push](https://developer.okta.com/docs/api/resources/authn#verify-push-factor)

* `autoPush` - Optional parameter to send a push notification immediately the next time `verify` is called on a push factor

```javascript
var pushFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'push';
});

pushFactor.verify({
  autoPush: true
});
```

###### [All other factors](https://developer.okta.com/docs/api/resources/authn#verify-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'YOUR_PROVIDER' && factor.factorType === 'yourFactorType';
});

factor.verify();
```

#### MFA_CHALLENGE

The user must verify the factor-specific challenge.
<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    status: 'MFA_CHALLENGE',
    expiresAt: '2014-11-02T23:39:03.319Z',
    factorResult: 'WAITING', // or CANCELLED, TIMEOUT, or ERROR
    user: {
      id: '00ugti3kwafWJBRIY0g3',
      profile: {
        login: 'isaac@example.org',
        firstName: 'Isaac',
        lastName: 'Brock',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      },
    },
    factor: {
      id: 'smsigwDlH85L9FyQK0g3',
      factorType: 'sms',
      provider: 'OKTA',
      profile: {
        phoneNumber: '+1 XXX-XXX-6688'
      }
    },
    verify: function(options) { /* returns another transaction */ },
    poll: function() { /* returns another transaction */ },
    prev: function() { /* returns another transaction */ },
    cancel: function() { /* terminates the auth flow */ },
    data: { /* the parsed json response */ }
  }
  ```

</details>

##### `verify(options)`

* `passCode` - OTP sent to device
* `autoPush` - Optional parameter to send a push notification immediately the next time [`verify`](https://developer.okta.com/docs/api/resources/authn#verify-factor) is called on a push factor

```javascript
transaction.verify({
  passCode: '615243',
  autoPush: true
});
```

##### `poll(options)`

* `autoPush` - Optional parameter to send a push notification immediately the next time `verify` is called on a push factor

[Poll](https://developer.okta.com/docs/api/resources/authn#activate-push-factor) until factorResult is not WAITING. Throws AuthPollStopError if prev, resend, or cancel is called.

```javascript
transaction.poll({
  autoPush: true
});
```

##### `prev()`

End current factor verification and [return to](https://developer.okta.com/docs/api/resources/authn#previous-transaction-state) `MFA_REQUIRED`.

```javascript
transaction.prev();
```

#### SUCCESS

The end of the authentication flow! This transaction contains a sessionToken you can exchange for an Okta cookie, an `id_token`, or `access_token`.

<details>
  <summary><b>Example Response</b></summary>

  ```javascript
  {
    expiresAt: '2015-06-08T23:34:34.000Z',
    status: 'SUCCESS',
    sessionToken: '00p8RhRDCh_8NxIin-wtF5M6ofFtRhfKWGBAbd2WmE',
    user: {
      id: '00uhm5QzwyZZxjrfp0g3',
      profile: {
        login: 'exampleUser@example.com',
        firstName: 'Test',
        lastName: 'User',
        locale: 'en_US',
        timeZone: 'America/Los_Angeles'
      }
    }
  }
  ```

</details>

### `session`

#### `session.setCookieAndRedirect(sessionToken, redirectUri)`

This allows you to create a session using a sessionToken.

* `sessionToken` - Ephemeral one-time token used to bootstrap an Okta session.
* `redirectUri` - After setting a cookie, Okta redirects to the specified URI. The default is the current URI.

```javascript
authClient.session.setCookieAndRedirect(transaction.sessionToken);
```

#### `session.exists()`

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

### `token`

#### Extended OpenID Connect options

The following configuration options can **only** be included in `token.getWithoutPrompt`, `token.getWithPopup`, or `token.getWithRedirect`.

| Options | Description |
| :-------: | ----------|
| `sessionToken` | Specify an Okta sessionToken to skip reauthentication when the user already authenticated using the Authentication Flow. |
| `responseMode` | Specify how the authorization response should be returned. You will generally not need to set this unless you want to override the default values for `token.getWithRedirect`. See [Parameter Details](https://developer.okta.com/docs/api/resources/oidc#parameter-details) for a list of available modes. |
| `responseType` | Specify the [response type](https://developer.okta.com/docs/api/resources/oidc#request-parameters) for OIDC authentication. Defaults to `id_token`. |
| | Use an array if specifying multiple response types - in this case, the response will contain both an ID Token and an Access Token. `responseType: ['id_token', 'token']` |
| `scopes` | Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`. For a list of available scopes, see [Scopes and Claims](https://developer.okta.com/docs/api/resources/oidc#access-token-scopes-and-claims). |
| `state` | Specify a state that will be validated in an OAuth response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string. |
| `nonce` | Specify a nonce that will be validated in an `id_token`. This is usually only provided during redirect flows to obtain an authorization code that will be exchanged for an `id_token`. Defaults to a random string. |

For a list of all available parameters that can be passed to the `/authorize` endpoint, see Okta's [Authorize Request API](https://developer.okta.com/docs/api/resources/oidc#request-parameters).

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
.then(function(tokenOrTokens) {
  // manage token or tokens
})
.catch(function(err) {
  // handle OAuthError
});
```

#### `token.getWithoutPrompt(oauthOptions)`

When you've obtained a sessionToken from the authorization flows, or a session already exists, you can obtain a token or tokens without prompting the user to log in.

* `oauthOptions` - See [Extended OpenID Connect options](#extended-openid-connect-options)

```javascript
authClient.token.getWithoutPrompt({
  responseType: 'id_token', // or array of types
  sessionToken: 'testSessionToken' // optional if the user has an existing Okta session
})
.then(function(tokenOrTokens) {
  // manage token or tokens
})
.catch(function(err) {
  // handle OAuthError
});
```

#### `token.getWithPopup(oauthOptions)`

Create token with a popup.

* `oauthOptions` - See [Extended OpenID Connect options](#extended-openid-connect-options)

```javascript
authClient.token.getWithPopup(oauthOptions)
.then(function(tokenOrTokens) {
  // manage token or tokens
})
.catch(function(err) {
  // handle OAuthError
});
```

#### `token.getWithRedirect(options)`

Create token using a redirect.

* `oauthOptions` - See [Extended OpenID Connect options](#extended-openid-connect-options)

```javascript
authClient.token.getWithRedirect(oauthOptions);
```

#### `token.parseFromUrl(options)`

Parses the access or ID Tokens from the url after a successful authentication redirect.

```javascript
authClient.token.parseFromUrl()
.then(function(tokenOrTokens) {
  // manage token or tokens
})
.catch(function(err) {
  // handle OAuthError
});
```

#### `token.decode(idTokenString)`

Decode a raw ID Token

* `idTokenString` - an id_token JWT

```javascript
authClient.token.decode('YOUR_ID_TOKEN_JWT');
```

#### `token.renew(tokenToRenew)`

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

#### `token.getUserInfo(accessTokenObject)`

Retrieve the [details about a user](https://developer.okta.com/docs/api/resources/oidc#response-example-success).

* `accessTokenObject` - an access token returned by this library. note: this is not the raw access token

```javascript
authClient.token.getUserInfo(accessTokenObject)
.then(function(user) {
  // user has details about the user
});
```

#### `token.verify(idTokenObject)`

Verify the validity of an ID token's claims and check the signature on browsers that support web cryptography.

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

### `tokenManager`

#### `tokenManager.add(key, token)`

After receiving an `access_token` or `id_token`, add it to the `tokenManager` to manage token expiration and renew operations. When a token is added to the `tokenManager`, it is automatically renewed when it expires.

* `key` - Unique key to store the token in the `tokenManager`. This is used later when you want to get, delete, or renew the token.
* `token` - Token object that will be added

```javascript
authClient.token.getWithPopup()
.then(function(idToken) {
  authClient.tokenManager.add('idToken', idToken);
});
```

#### `tokenManager.get(key)`

Get a token that you have previously added to the `tokenManager` with the given `key`. The token object will be returned if it has not expired.

* `key` - Key for the token you want to get

```javascript
authClient.tokenManager.get('idToken')
.then(function(token) {
  if (token) {
    // Token is valid
    console.log(token);
  } else {
    // Token has expired
  }
})
.catch(function(err) {
  // OAuth Error
  console.error(err);
});
```

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

#### `tokenManager.renew(key)`

Manually renew a token before it expires.

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

* `event` - Event to subscribe to. Possible events are `expired`, `error`, and `renewed`.
* `callback` - Function to call when the event is triggered
* `context` - Optional context to bind the callback to

```javascript
// Triggered when the token has expired
authClient.tokenManager.on('expired', function (key, expiredToken) {
  console.log('Token with key', key, ' has expired:');
  console.log(expiredToken);
});

authClient.tokenManager.on('renewed', function (key, newToken, oldToken) {
  console.log('Token with key', key, 'has been renewed');
  console.log('Old token:', oldToken);
  console.log('New token:', newToken);
});

// Triggered when an OAuthError is returned via the API
authClient.tokenManager.on('error', function (err) {
  console.log('TokenManager error:', err.message);
  // err.name
  // err.message
  // err.errorCode
  // err.errorSummary
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

## Building the SDK

In most cases, you won't need to build the SDK from source. If you want to build it yourself, you'll need to follow these steps:

```bash
# Clone the repo
git clone https://github.com/okta/okta-auth-js.git

# Navigate into the new `okta-auth-js` filder, and install Okta node dependencies
cd okta-auth-js
npm install

# Build the SDK. The output will be under `dist`
npm run build
```

### Build and Test Commands

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm run build`       | Build the SDK with a sourcemap |
| `npm test`            | Run unit tests using PhantomJS |
| `npm run lint:report` | Run eslint linting tests       |

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](contributing.md) to understand how to structure a contribution.

[devforum]: https://devforum.okta.com/
[lang-landing]: https://developer.okta.com/code/javascript
[github-issues]: https://github.com/okta/okta-auth-js/issues
[github-releases]: https://github.com/okta/okta-auth-js/releases
