<!-- START GITHUB ONLY -->
[![Build Status](https://travis-ci.org/okta/okta-auth-js.svg?branch=master)](https://travis-ci.org/okta/okta-auth-js)
<!-- END GITHUB ONLY -->

Introduction
============

The Okta Auth SDK builds on top of our [Authentication API](http://developer.okta.com/docs/api/resources/authn.html) and [OAuth 2.0 API](http://developer.okta.com/docs/api/resources/oidc.html) to enable you to create a fully branded sign-in experience using JavaScript.

<!-- START GITHUB ONLY -->
For an overview of the client's features and authentication flows, check out [our developer docs](http://developer.okta.com/docs/guides/okta_auth_sdk.html).

Read our [contributing guidelines](./CONTRIBUTING.md) if you wish to contribute.

# Table of Contents

* [Install](#install)
  * [Using the Okta CDN](#using-the-okta-cdn)
  * [Using the npm module](#using-the-npm-module)
* [API](#api)
  * [OktaAuth](#new-oktaauthconfig)
  * [signIn](#signinoptions)
  * [signOut](#signout)
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
      * [Enroll Factor](#enroll-factor)
    * [MFA_ENROLL_ACTIVATE](#mfa_enroll_activate)
    * [MFA_REQUIRED](#mfa_required)
    * [MFA_CHALLENGE](#mfa_challenge)
    * [SUCCESS](#success)
  * [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi)
  * [session.exists](#sessionexists)
  * [session.get](#sessionget)
  * [session.refresh](#sessionrefresh)
  * [token.getWithoutPrompt](#tokengetwithoutpromptoauthoptions)
  * [token.getWithPopup](#tokengetwithpopupoauthoptions)
  * [token.getWithRedirect](#tokengetwithredirectoptions)
  * [token.parseFromUrl](#tokenparsefromurloptions)
  * [token.decode](#tokendecodeidtokenstring)
  * [token.refresh](#tokenrefreshtokentorefresh)
  * [token.getUserInfo](#tokengetuserinfoaccesstokenobject)
  * [token.verify](#tokenverifyidtokenobject)
  * [tokenManager.add](#tokenmanageraddkey-token)
  * [tokenManager.get](#tokenmanagergetkey)
  * [tokenManager.remove](#tokenmanagerremovekey)
  * [tokenManager.clear](#tokenmanagerclear)
  * [tokenManager.refresh](#tokenmanagerrefreshkey)
  * [tokenManager.on](#tokenmanagerontokenevent-callback-context)
  * [tokenManager.off](#tokenmanageroffevent-callback)
* [OpenId Connect Options](#openid-connect-options)
* [Client Configuration](#client-configuration)
* [Developing the Okta Auth Client](#developing-the-okta-auth-client)
  * [Building the Client](#building-the-client)
  * [Build and Test Commands](#build-and-test-commands)
<!-- END GITHUB ONLY -->

# Install

You can include Okta Auth JS in your project either directly from the Okta CDN, or by packaging it with your app via our npm package, [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js).

## Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with okta-auth-js, and don't already have an existing build process that leverages [npm](https://www.npmjs.com/) for external dependencies.

To use the CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript: 1.6.0 -->
<script
  src="https://ok1static.oktacdn.com/assets/js/sdk/okta-auth-js/1.6.0/okta-auth-js.min.js"
  type="text/javascript"></script>
```

The `okta-auth-js.min.js` file will expose a global `OktaAuth` object. Use it to bootstrap the client:

```javascript
var authClient = new OktaAuth({/* configOptions */});
```

## Using the npm module

Using our npm module is a good choice if:

- You have a build system in place where you manage dependencies with npm.

- You do not want to load scripts directly from third party sites.

To install [@okta/okta-auth-js](https://www.npmjs.com/package/@okta/okta-auth-js):

```bash
# Run this command in your project root folder.
[project-root-folder]$ npm install @okta/okta-auth-js --save
```

After running `npm install`:

The minified auth client will be installed to `node_modules/@okta/okta-auth-js/dist`. You can copy the `dist` contents to a publicly hosted directory. However, if you're using a bundler like [Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/), you can simply import the module using CommonJS.

```javascript
var OktaAuth = require('@okta/okta-auth-js');
var authClient = new OktaAuth(/* configOptions */);
```

# API

## new OktaAuth(config)

Creates a new instance of the Okta Auth Client with the provided options. The client has many [config options](#configuration). The only required option to get started is `url`, the base url for your Okta domain.

  - `config` - Options that are used to configure the client

```javascript
var authClient = new OktaAuth({url: 'https://acme.okta.com'});
```

## signIn(options)

The goal of an authentication flow is to [set an Okta session cookie on the user's browser](http://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-by-visiting-a-session-redirect-link) or [retrieve an `id_token` or `access_token`](http://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-via-openid-connect-authorization-endpoint). The flow is started using `signIn`.

  - `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
  - `password` - The password of the user

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

## signOut()

Signs the user out of their current Okta [session](http://developer.okta.com/docs/api/resources/sessions.html#example).

```javascript
authClient.signOut()
.then(function() {
  console.log('successfully logged out');
})
.fail(function(err) {
  console.error(err);
});
```

## [forgotPassword(options)](http://developer.okta.com/docs/api/resources/authn.html#forgot-password)

Starts a new password recovery transaction for a given user and issues a recovery token that can be used to reset a user’s password.

  - `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
  - `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
  - `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

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

## [unlockAccount(options)](http://developer.okta.com/docs/api/resources/authn.html#unlock-account)

Starts a new unlock recovery transaction for a given user and issues a recovery token that can be used to unlock a user’s account.

  - `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
  - `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
  - `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

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

## [verifyRecoveryToken(options)](http://developer.okta.com/docs/api/resources/authn.html#verify-recovery-token)

Validates a recovery token that was distributed to the end-user to continue the recovery transaction.

- `recoveryToken` - Recovery token that was distributed to end-user via an out-of-band mechanism such as email

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

## tx.resume()

Resumes an in-progress **transaction**. This is useful if a user navigates away from the login page before authentication is complete.

```javascript
authClient.tx.exists()
.then(function(exists) {
  if (exists) {
    return authClient.tx.resume();
  }
  throw new Error('a session does not exist');
})
.then(function(transaction) {
  console.log('current status:', transaction.status);
})
.fail(function(err) {
  console.error(err);
});
```

## tx.exists()

Check for a **transaction** to be resumed. This is synchronous and returns `true` or `false`.

```javascript
var exists = authClient.tx.exists()
if (exists) {
  console.log('a session exists');
} else {
  console.log('a session does not exist');
}
```

## transaction.status

When Auth Client methods resolve, they return a **transaction** object that encapsulates [the new state in the authentication flow](http://developer.okta.com/docs/api/resources/authn.html#transaction-model). This **transaction** contains metadata about the current state, and methods that can be used to progress to the next state.

![State Model Diagram](http://developer.okta.com/assets/img/auth-state-model.png "State Model Diagram")

Sample transactions and their methods:

### Common methods

#### cancel()

Terminates the current auth flow.

```javascript
transaction.cancel()
.then(function() {
  // transaction canceled. You can now start another with authClient.signIn
});
```

### [LOCKED_OUT](http://developer.okta.com/docs/api/resources/authn.html#show-lockout-failures)

The user account is locked; self-service unlock or admin unlock is required.

```javascript
{
  status: 'LOCKED_OUT',
  unlock: function(options) { /* returns another transaction */ },
  cancel: function() { /* terminates the auth flow */ },
  data: { /* the parsed json response */ }
}
```

#### [unlock(options)](http://developer.okta.com/docs/api/resources/authn.html#unlock-account)

  - `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
  - `factorType` - Recovery factor to use for primary authentication. Supported options are `SMS`, `EMAIL`, or `CALL`
  - `relayState` - Optional state value that is persisted for the lifetime of the recovery transaction

```javascript
transaction.unlock({
  username: 'dade.murphy@example.com',
  factorType: 'EMAIL'
});
```

#### [cancel()](#cancel)

### [PASSWORD_EXPIRED](http://developer.okta.com/docs/api/resources/authn.html#response-example-expired-password)

The user’s password was successfully validated but is expired.

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

#### [changePassword(options)](http://developer.okta.com/docs/api/resources/authn.html#reset-password)

  - `oldPassword` - User’s current password that is expired
  - `newPassword` - New password for user

```javascript
transaction.changePassword({
  oldPassword: '0ldP4ssw0rd',
  newPassword: 'N3wP4ssw0rd'
});
```

#### [cancel()](#cancel)

### PASSWORD_RESET

The user successfully answered their recovery question and can set a new password.

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

#### [resetPassword(options)](http://developer.okta.com/docs/api/resources/authn.html#reset-password)

  - `newPassword` - New password for user

```javascript
transaction.resetPassword({
  newPassword: 'N3wP4ssw0rd'
});
```

#### [cancel()](#cancel)

### PASSWORD_WARN

The user’s password was successfully validated but is about to expire and should be changed.

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

#### [changePassword(options)](http://developer.okta.com/docs/api/resources/authn.html#change-password)

  - `oldPassword` - User’s current password that is about to expire
  - `newPassword` - New password for user

```javascript
transaction.changePassword({
  oldPassword: '0ldP4ssw0rd',
  newPassword: 'N3wP4ssw0rd'
});
```

#### skip()

Ignore the warning and continue.

```javascript
transaction.skip();
```

#### [cancel()](#cancel)

### RECOVERY

The user has requested a recovery token to reset their password or unlock their account.

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

#### [answer(options)](http://developer.okta.com/docs/api/resources/authn.html#answer-recovery-question)

  - `answer` - Answer to user’s recovery question

```javascript
transaction.answer({
  answer: 'My favorite recovery question answer'
});
```

#### [recovery(options)](http://developer.okta.com/docs/api/resources/authn.html#verify-recovery-token)

  - `recoveryToken` - Recovery token that was distributed to end-user via out-of-band mechanism such as email

```javascript
transaction.recovery({
  recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
});
```

#### [cancel()](#cancel)

### RECOVERY_CHALLENGE

The user must verify the factor-specific recovery challenge.

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

#### [verify(options)](http://developer.okta.com/docs/api/resources/authn.html#verify-sms-recovery-factor)

  - `passCode` - OTP sent to device

```javascript
transaction.verify({
  passCode: '615243'
});
```

#### [resend()](http://developer.okta.com/docs/api/resources/authn.html#resend-sms-recovery-challenge)

Resend the recovery email or text.

```javascript
transaction.resend();
```

#### [cancel()](#cancel)

### MFA_ENROLL

When MFA is required, but a user isn’t enrolled in MFA, they must enroll in at least one factor.

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

#### [cancel()](#cancel)

#### Enroll Factor

To enroll in a factor, select one from the factors array, then use the following methods.

```javascript
var factor = transaction.factors[/* index of the desired factor */];
```

##### [questions()](http://developer.okta.com/docs/api/resources/factors.html#list-security-questions)

List the available questions for the question factorType.

```javascript
var questionFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'question';
});

questionFactor.questions()
.then(function(questions) {
  // Display questions for the user to select from
});
```

##### enroll(options)

The enroll options depend on the desired factor.

###### [OKTA question](http://developer.okta.com/docs/api/resources/factors.html#enroll-okta-security-question-factor)

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

###### [OKTA sms](http://developer.okta.com/docs/api/resources/factors.html#enroll-okta-sms-factor)

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

###### [OKTA call](http://developer.okta.com/docs/api/resources/factors.html#enroll-okta-call-factor)

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

###### [OKTA push](http://developer.okta.com/docs/api/resources/factors.html#enroll-okta-verify-push-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'push';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [OKTA token:software:totp](http://developer.okta.com/docs/api/resources/factors.html#enroll-okta-verify-totp-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'token:software:totp';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [GOOGLE token:software:totp](http://developer.okta.com/docs/api/resources/factors.html#enroll-google-authenticator-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'GOOGLE' && factor.factorType === 'token:software:totp';
});

factor.enroll();

// The phone will need to scan a QR Code in MFA_ENROLL_ACTIVATE
```

###### [YUBICO token:hardware](http://developer.okta.com/docs/api/resources/factors.html#enroll-yubikey-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'YUBICO' && factor.factorType === 'token:hardware';
});

factor.enroll({
  passCode: 'cccccceukngdfgkukfctkcvfidnetljjiknckkcjulji'
});
```

###### [RSA token](http://developer.okta.com/docs/api/resources/factors.html#enroll-rsa-securid-factor)

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

###### [SYMANTEC token](http://developer.okta.com/docs/api/resources/factors.html#enroll-symantec-vip-factor)

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

### MFA_ENROLL_ACTIVATE

The user must activate the factor to complete enrollment.

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

#### resend()

Send another OTP if user doesn’t receive the original activation SMS OTP.

```javascript
transaction.resend();
```

#### [activate(options)](http://developer.okta.com/docs/api/resources/authn.html#activate-sms-factor)

  - `passCode` - OTP sent to device

```javascript
transaction.activate({
  passCode: '615243'
});
```

#### [poll()](http://developer.okta.com/docs/api/resources/authn.html#activate-push-factor)

Poll until factorResult is not WAITING. Throws AuthPollStopError if prev, resend, or cancel is called.

```javascript
transaction.poll();
```

#### [prev()](http://developer.okta.com/docs/api/resources/authn.html#previous-transaction-state)

End current factor enrollment and return to `MFA_ENROLL`.

```javascript
transaction.prev();
```

#### [cancel()](#cancel)

### MFA_REQUIRED

The user must provide additional verification with a previously enrolled factor.

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

#### [cancel()](#cancel)

#### [Verify Factor](http://developer.okta.com/docs/api/resources/authn.html#verify-factor)

To verify a factor, select one from the factors array, then use the following methods.

```javascript
var factor = transaction.factors[/* index of the desired factor */];
```

###### [OKTA question](http://developer.okta.com/docs/api/resources/authn.html#verify-security-question-factor)

```javascript
var questionFactor = transaction.factors.find(function(factor) {
  return factor.provider === 'OKTA' && factor.factorType === 'question';
});

questionFactor.verify({
  answer: 'mayonnaise'
});
```

###### [All other factors](http://developer.okta.com/docs/api/resources/authn.html#verify-factor)

```javascript
var factor = transaction.factors.find(function(factor) {
  return factor.provider === 'YOUR_PROVIDER' && factor.factorType === 'yourFactorType';
});

factor.verify();
```

### MFA_CHALLENGE

The user must verify the factor-specific challenge.

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

#### [verify(options)](http://developer.okta.com/docs/api/resources/authn.html#verify-factor)

  - `passCode` - OTP sent to device

```javascript
transaction.verify({
  passCode: '615243'
});
```

#### [poll()](http://developer.okta.com/docs/api/resources/authn.html#activate-push-factor)

Poll until factorResult is not WAITING. Throws AuthPollStopError if prev or cancel is called.

```javascript
transaction.poll();
```

#### [prev()](http://developer.okta.com/docs/api/resources/authn.html#previous-transaction-state)

End current factor verification and return to `MFA_REQUIRED`.

```javascript
transaction.prev();
```

#### [cancel()](#cancel)

### SUCCESS

The end of the authentication flow! This transaction contains a sessionToken you can exchange for an Okta cookie, an `id_token`, or `access_token`.

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

## session.setCookieAndRedirect(sessionToken, redirectUri)

This allows you to create a session using a sessionToken.

  - `sessionToken` - Ephemeral one-time token used to bootstrap an Okta session.
  - `redirectUri` - After setting a cookie, Okta redirects to the specified URI. The default is the current URI.

```javascript
authClient.session.setCookieAndRedirect(transaction.sessionToken);
```

## session.exists()

Returns a promise that resolves with `true` if there is an existing Okta [session](http://developer.okta.com/docs/api/resources/sessions.html#example), or `false` if not.

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

## session.get()

Gets the active [session](http://developer.okta.com/docs/api/resources/sessions.html#example).

```javascript
authClient.session.get()
.then(function(session) {
  // logged in
})
.catch(function(err) {
  // not logged in
});
```

## session.refresh()

Refresh the current session by extending its lifetime. This can be used as a keep-alive operation.

```javascript
authClient.session.get()
.then(function(session) {
  // existing session is now refreshed
})
.catch(function(err) {
  // there was a problem refreshing (the user may not have an existing session)
});
```

## token.getWithoutPrompt(oauthOptions)

When you've obtained a sessionToken from the authorization flows, or a session already exists, you can obtain a token or tokens without prompting the user to log in.

  - `oauthOptions` - See [OIDC Configuration](#openid-connect-options)

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

## token.getWithPopup(oauthOptions)

Create token with a popup.

  - `oauthOptions` - See [OIDC Configuration](#openid-connect-options)

```javascript
authClient.token.getWithPopup(oauthOptions)
.then(function(tokenOrTokens) {
  // manage token or tokens
})
.catch(function(err) {
  // handle OAuthError
});
```

## token.getWithRedirect(options)

Create token using a redirect.

  - `oauthOptions` - See [OIDC Configuration](#openid-connect-options)

```javascript
authClient.token.getWithRedirect(oauthOptions);
```

## token.parseFromUrl(options)

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

## token.decode(idTokenString)

Decode a raw ID Token

  - `idTokenString` - an id_token JWT

```javascript
authClient.token.decode('YOUR_ID_TOKEN_JWT');
```

## token.refresh(tokenToRefresh)

Returns a new token if the Okta [session](http://developer.okta.com/docs/api/resources/sessions.html#example) is still valid.

  - `tokenToRefresh` - an access token or ID token previously provided by Okta. note: this is not the raw JWT

```javascript
// this token is provided by Okta via getWithoutPrompt, getWithPopup, and parseFromUrl
var tokenToRefresh = {
  idToken: 'YOUR_ID_TOKEN_JWT',
  claims: { /* token claims */ },
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://example.okta.com/oauth2/v1/authorize',
  issuer: 'https://example.okta.com',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

authClient.token.refresh(tokenToRefresh)
.then(function(freshToken) {
  // manage freshToken
})
.catch(function(err) {
  // handle OAuthError
});
```

## token.getUserInfo(accessTokenObject)

Retrieve the [details about a user](http://developer.okta.com/docs/api/resources/oidc.html#response-example-success).

  - `accessTokenObject` - an access token returned by this library. note: this is not the raw access token

```javascript
authClient.token.getUserInfo(accessTokenObject)
.then(function(user) {
  // user has details about the user
});
```

## token.verify(idTokenObject)

Verify the validity of an ID token's claims and check the signature on browsers that support web cryptography.

  - `idTokenObject` - an ID token returned by this library. note: this is not the raw ID token JWT

```javascript
authClient.token.verify(idTokenObject)
.then(function() {
  // the idToken is valid
})
.catch(function(err) {
  // handle AuthSdkError
});
```

## tokenManager.add(key, token)

After receiving an `access_token` or `id_token`, add it to the `tokenManager` to manage token expiration and refresh operations. When a token is added to the `tokenManager`, it is automatically refreshed when it expires.

- `key` - Unique key to store the token in the `tokenManager`. This is used later when you want to get, delete, or refresh the token.
- `token` - Token object that will be added

```javascript
authClient.token.getWithPopup()
.then(function(idToken) {
  authClient.tokenManager.add('my_id_token', idToken);
});
```

## tokenManager.get(key)

Get a token that you have previously added to the `tokenManager` with the given `key`.

- `key` - Key for the token you want to get

```javascript
var token = authClient.tokenManager.get('my_id_token');
```

## tokenManager.remove(key)

Remove a token from the `tokenManager` with the given `key`.

- `key` - Key for the token you want to remove

```javascript
authClient.tokenManager.remove('my_id_token');
```

## tokenManager.clear()

Remove all tokens from the `tokenManager`.

```javascript
authClient.tokenManager.clear();
```

## tokenManager.refresh(key)

Manually refresh a token before it expires.

- `key` - Key for the token you want to refresh

```javascript
// Because the refresh() method is async, you can wait for it to complete
// by using the returned Promise:
authClient.tokenManager.refresh('my_id_token')
.then(function (newToken) {
  // doSomethingWith(newToken);
});

// Alternatively, you can subscribe to the 'refreshed' event:
authClient.tokenManager.on('refreshed', function (key, newToken, oldToken) {
  // doSomethingWith(newToken);
});
authClient.tokenManager.refresh('my_id_token');
```

## tokenManager.on(event, callback[, context])

Subscribe to an event published by the `tokenManager`.

- `event` - Event to subscribe to. Possible events are `expired`, `error`, and `refreshed`.
- `callback` - Function to call when the event is triggered
- `context` - Optional context to bind the callback to

```javascript
authClient.tokenManager.on('expired', function (key, expiredToken) {
  console.log('Token with key', key, ' has expired:');
  console.log(expiredToken);
});

authClient.tokenManager.on('error', function (err) {
  console.log('TokenManager error:', err);
});

authClient.tokenManager.on('refreshed', function (key, newToken, oldToken) {
  console.log('Token with key', key, 'has been refreshed');
  console.log('Old token:', oldToken);
  console.log('New token:', newToken);
});
```

## tokenManager.off(event[, callback])

Unsubscribe from `tokenManager` events. If no callback is provided, unsubscribes all listeners from the event.

- `event` - Event to unsubscribe from
- `callback` - Optional callback that was used to subscribe to the event

```javascript
authClient.tokenManager.off('refreshed');
authClient.tokenManager.off('refreshed', myRefreshedCallback);
```

# Client Configuration

The only required configuration option is `url`. All others are optional.

```javascript
var config = {
  url: 'https://your-org.okta.com',
  clientId: 'your-client-id',
  redirectUri: 'https://your.redirect.uri/redirect'
};

var authClient = new OktaAuth(config);
```

- **url:** The URL for your Okta organization

  ```javascript
  // Production org with subdomain "acme"
  url: 'https://acme.okta.com'

  // Can also target oktapreview and okta-emea, i.e.
  url: 'https://acme.oktapreview.com'
  ```

- **ajaxRequest** The ajax request implementation. By default, this is implemented using [reqwest](https://github.com/ded/reqwest). To provide your own request library, implement the following interface:

  1. Must accept:
    - method (http method)
    - url (target url)
    - args (object containing headers and data)

  2. Must return a Promise that resolves with a raw XMLHttpRequest response

  ```javascript
  ajaxRequest: function(method, url, args) {
    /*
    args is in the form:
    {
      headers: {
        headerName: headerValue
      },
      data: postBodyData
    }
    */
    return Promise.resolve(/* a raw XMLHttpRequest response */);
  }
  ```

  If you're using a bundler like webpack or browserify, we have implementations for jquery and reqwest included. To use them, import the SDK like this:

  ```javascript
  // reqwest
  var OktaAuth = require('@okta/okta-auth-js/reqwest');

  // jquery
  var OktaAuth = require('@okta/okta-auth-js/jquery');
  ```

# OpenId Connect Options

Options for the [OpenId Connect](http://developer.okta.com/docs/api/resources/oidc.html) authentication flow. This flow is required for social authentication, and requires OAuth client registration with Okta. For instructions, see [Social Authentication](http://developer.okta.com/docs/api/resources/social_authentication.html).

## Can be in Client Configuration

These configuration options can be included when instantiating Okta Auth JS (`new OktaAuth(config)`) or in `token.getWithoutPrompt`, `token.getWithPopup`, or `token.getWithRedirect`. If included in both, the value passed in the method takes priority.

- **clientId:** Client Id pre-registered with Okta for the OIDC authentication flow.

  ```javascript
  clientId: 'GHtf9iJdr60A9IYrR0jw'
  ```

- **redirectUri:** The url that is redirected to when using `token.getWithRedirect`. This must be pre-registered as part of client registration. If no `redirectUri` is provided, defaults to the current origin.

  ```javascript
  redirectUri: 'https://acme.com/oauth2/callback/home'
  ```

- **issuer:** Specify a custom issuer to perform the OIDC flow. Defaults to the baseUrl.

  ```javascript
  issuer: 'https://your-org.okta.com/oauth2/aus8aus76q8iphupD0h7'
  ```

- **authorizeUrl:** Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize".

  ```javascript
  issuer: 'https://your-org.okta.com/oauth2/aus8aus76q8iphupD0h7',
  authorizeUrl: 'https://your-org.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize'
  ```

- **userinfoUrl:** Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/userinfo".

  ```javascript
  issuer: 'https://your-org.okta.com/oauth2/aus8aus76q8iphupD0h7',
  userinfoUrl: 'https://your-org.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
  ```

## Cannot be in Client Configuration

- **sessionToken** Specify an Okta sessionToken to skip reauthentication when the user already authenticated using the Authentication Flow.

  ```javascript
  sessionToken: '00p8RhRDCh_8NxIin-wtF5M6ofFtRhfKWGBAbd2WmE'
  ```

- **responseMode:** Specify how the authorization response should be returned. You will generally not need to set this unless you want to override the default values for `token.getWithRedirect`.

  - `okta_post_message` - Used with `token.getWithPopup` and `token.getWithoutPrompt`. Uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the response from the popup or iframe to the origin window.

  - `fragment` - Default value when using `token.getWithRedirect` and `responseType != 'code'`. Returns the authorization response in the hash fragment of the URL after the authorization redirect.

  - `query` - Default value when using `token.getWithRedirect` and `responseType = 'code'`. Returns the authorization response in the query string of the URL after the authorization redirect.

  - `form_post` - Returns the authorization response as a form POST after the authorization redirect. Use this when using `token.getWithRedirect` and you do not want the response returned in the URL.

  ```javascript
  // Use form_post instead of query in the Authorization Code flow
  responseType: 'code',
  responseMode: 'form_post'
  ```

- **responseType:** Specify the response type for OIDC authentication. Defaults to `id_token`.

  Valid response types are `id_token`, `access_token`, and `code`. Note that `code` goes through the Authorization Code flow, which requires the server to exchange the Authorization Code for tokens.

  ```javascript
  // Specifying a single responseType
  responseType: 'token'

  // Use an array if specifying multiple response types - in this case,
  // the response will contain both an ID Token and an Access Token.
  responseType: ['id_token', 'token']
  ```

- **scopes:** Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`.

  Valid OIDC scopes: `openid`, `email`, `profile`, `address`, `phone`

  ```javascript
  scopes: ['openid', 'email', 'profile', 'address', 'phone']
  ```

- **state:** Specify a state that will be validated in an OAuth response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string.

  ```javascript
  state: '8rFzn3MH5q'
  ```

- **nonce:** Specify a nonce that will be validated in an `id_token`. This is usually only provided during redirect flows to obtain an authorization code that will be exchanged for an `id_token`. Defaults to a random string.

  ```javascript
  nonce: '51GePTswrm'
  ```

# Developing the Okta Auth Client

## Building the Client

1. Clone the repo.

   ```bash
   [path]$ git clone git@github.com:okta/okta-auth-js.git
   ```

2. Navigate to the new `okta-auth-js` folder, and install the Okta node dependencies.

   ```bash
   [path/okta-auth-js]$ npm install
   ```

3. Build the SDK. The output will be under `dist/browser/`. The standalone version is `okta-auth-js.min.js`.

   ```bash
   [path/okta-auth-js]$ npm run build
   ```

## Build and Test Commands

| Command | Description |
| --- | --- |
| `npm run build` | Build the SDK with a sourcemap |
| `npm test` | Run unit tests using PhantomJS |
| `npm run lint:report` | Run eslint linting tests |
