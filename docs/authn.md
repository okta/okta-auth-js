[Okta Authentication API]: https://developer.okta.com/docs/reference/api/authn/
[Okta Identity Engine]: https://developer.okta.com/docs/concepts/ie-intro/

<!-- omit in toc -->
# Okta Authentication API (authn)

> :warning: There is a new version of Okta's Authentication APIs. New applications should use the IDX API instead. Existing applications which use the Authn API will continue to work, but you should [migrate](#migrating-to-idx)) your apps to use the [IDX APIs](./idx.md) if you want to leverage newer Okta capabilities.

- [Introduction](#introduction)
- [Migrating to IDX](#migrating-to-idx)
- [API](#api)
  - [`signInWithCredentials(options)`](#signinwithcredentialsoptions)
  - [`forgotPassword(options)`](#forgotpasswordoptions)
  - [`unlockAccount(options)`](#unlockaccountoptions)
  - [`verifyRecoveryToken(options)`](#verifyrecoverytokenoptions)
  - [`tx.resume()`](#txresume)
  - [`tx.exists()`](#txexists)
  - [`session.setCookieAndRedirect(sessionToken, redirectUri)`](#sessionsetcookieandredirectsessiontoken-redirecturi)
  - [`transaction.status`](#transactionstatus)
    - [Common methods](#common-methods)
      - [`cancel()`](#cancel)
      - [`changePassword(options)`](#changepasswordoptions)
      - [`resetPassword(options)`](#resetpasswordoptions)
      - [`skip()`](#skip)
    - [LOCKED_OUT](#locked_out)
      - [`unlock(options)`](#unlockoptions)
    - [PASSWORD_EXPIRED](#password_expired)
    - [PASSWORD_RESET](#password_reset)
    - [PASSWORD_WARN](#password_warn)
    - [RECOVERY](#recovery)
      - [`answer(options)`](#answeroptions)
      - [`recovery(options)`](#recoveryoptions)
    - [RECOVERY_CHALLENGE](#recovery_challenge)
      - [`verify(options)`](#verifyoptions)
      - [`resend()`](#resend)
    - [MFA_ENROLL](#mfa_enroll)
      - [`questions()`](#questions)
      - [`enroll(options)`](#enrolloptions)
        - [OKTA question](#okta-question)
        - [OKTA sms](#okta-sms)
        - [OKTA call](#okta-call)
        - [OKTA push](#okta-push)
        - [OKTA token:software:totp](#okta-tokensoftwaretotp)
        - [GOOGLE token:software:totp](#google-tokensoftwaretotp)
        - [YUBICO token:hardware](#yubico-tokenhardware)
        - [RSA token](#rsa-token)
        - [SYMANTEC token](#symantec-token)
    - [MFA_ENROLL_ACTIVATE](#mfa_enroll_activate)
      - [`resend()`](#resend-1)
      - [`activate(options)`](#activateoptions)
      - [`poll()`](#poll)
      - [`prev()`](#prev)
    - [MFA_REQUIRED](#mfa_required)
      - [Verify Factor](#verify-factor)
        - [OKTA question](#okta-question-1)
        - [OKTA push](#okta-push-1)
        - [All other factors](#all-other-factors)
    - [MFA_CHALLENGE](#mfa_challenge)
      - [`verify(options)`](#verifyoptions-1)
      - [`poll(options)`](#polloptions)
      - [`prev()`](#prev-1)
    - [SUCCESS](#success)
  
## Introduction

The [Okta Authentication API][] provides operations to authenticate users, perform multifactor enrollment and verification, recover forgotten passwords, and unlock accounts. It can be used as a standalone API to provide the identity layer on top of your existing application, or it can be integrated with the Okta Sessions API to obtain an Okta session cookie and access apps within Okta.

## Migrating to IDX

The [IDX API](./idx.md) is built on the [Okta Identity Engine][]. The API allows applications to implement features which were not possible with the older `authn` API, such as multi-factor authentication without redirection to Okta. We recommend that all new application deployments use the `IDX` API. Existing applications can migrate from `authn` to `IDX` by following [this guide](./migrate-from-authn-to-idx.md).

## API

### `signInWithCredentials(options)`

> :hourglass: async

The goal of this authentication flow is to [set an Okta session cookie on the user's browser](https://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-by-visiting-a-session-redirect-link) or [retrieve an `id_token` or `access_token`](https://developer.okta.com/use_cases/authentication/session_cookie#retrieving-a-session-cookie-via-openid-connect-authorization-endpoint). The flow is started using `signInWithCredentials`.

* `username` - User’s non-qualified short-name (e.g. dade.murphy) or unique fully-qualified login (e.g dade.murphy@example.com)
* `password` - The password of the user
* `sendFingerprint` - Enabling this will send a `X-Device-Fingerprint` header. Defaults to `false`. See [Primary authentication with device fingerprint](https://developer.okta.com/docs/reference/api/authn/#primary-authentication-with-device-fingerprinting) for more information on the `X-Device-Fingerprint` header.

```javascript
authClient.signInWithCredentials({
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
.catch(function(err) {
  console.error(err);
});
```

### `forgotPassword(options)`

> :hourglass: async

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
  // transaction.status == 'RECOVERY_CHALLENGE'
  return transaction.verify({
    passCode: '123456' // The passCode from the SMS or CALL
  });
})
.then(function(transaction) {
  // transaction.status == 'PASSWORD_RESET'
  return transaction.resetPassword({
    newPassword: 'N3wP4ssw0rd'
  });
})
.then(function(transaction) {
  if (transaction.status === 'SUCCESS') {
    authClient.session.setCookieAndRedirect(transaction.sessionToken);
  } else {
    throw 'We cannot handle the ' + transaction.status + ' status';
  }
})
.catch(function(err) {
  console.error(err);
});
```

### `unlockAccount(options)`

> :hourglass: async

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
.catch(function(err) {
  console.error(err);
});
```

### `verifyRecoveryToken(options)`

> :hourglass: async

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
.catch(function(err) {
  console.error(err);
});
```

### `tx.resume()`

> :hourglass: async

Resumes an in-progress **transaction**. This is useful if a user navigates away from the login page before authentication is complete.

```javascript
var exists = authClient.tx.exists();
if (exists) {
  authClient.tx.resume()
  .then(function(transaction) {
    console.log('current status:', transaction.status);
  })
  .catch(function(err) {
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

### `session.setCookieAndRedirect(sessionToken, redirectUri)`

> :link: web browser only <br>
> :warning: method requires access to [third party cookies] <br>(#third-party-cookies)

This allows you to create a session using a sessionToken.
* `sessionToken` - Ephemeral one-time token used to bootstrap an Okta session.
* `redirectUri` - After setting a cookie, Okta redirects to the specified URI. The default is the current URI.

```javascript
authClient.session.setCookieAndRedirect(transaction.sessionToken);
```

### `transaction.status`

> :hourglass: async

When Auth Client methods resolve, they return a **transaction** object that encapsulates [the new state in the authentication flow](https://developer.okta.com/docs/reference/api/authn/#transaction-state). This **transaction** contains metadata about the current state, and methods that can be used to progress to the next state.

![State Model Diagram](https://developer.okta.com/img/auth-state-model.png "State Model Diagram")

#### Common methods

##### `cancel()`

> :hourglass: async
Terminates the current auth flow.

```javascript
transaction.cancel()
.then(function() {
  // transaction canceled. You can now start another with authClient.signIn
});
```

##### `changePassword(options)`

See [authn API](#api).

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


