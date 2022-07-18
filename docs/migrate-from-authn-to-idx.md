<!-- omit in toc -->
# Migrating from authn to IDX

The [IDX API](./idx.md) is built on the [Okta Identity Engine](https://developer.okta.com/docs/concepts/ie-intro/). The API allows applications to implement features which were not possible with the older [authn API](./authn.md), such as multi-factor authentication without redirection to Okta. We recommend that all new application deployments use the `IDX` API. Existing applications using `authn` can migrate to `IDX` by following this guide.

- [Introduction to IDX](#introduction-to-idx)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [New Methods](#new-methods)
- [Transaction Model](#transaction-model)
- [Handling Errors](#handling-errors)
- [Basic Example](#basic-example)
- [Helpful Information and Resources](#helpful-information-and-resources)

## Introduction to IDX

The IDX API is designed to enable login experiences, like the Okta [SignIn Widget](#https://github.com/okta/okta-signin-widget). IDX is a brand new protocol and behaves differently than the traditional `authn` API. IDX pairs very well with dynamic-rendered or templated UI frameworks like React, Angular or even JSPs. Each IDX response describes a form, prompting the user for the inputs needed to proceed to the next step in the authentication flow. For example:

```javascript
const { nextStep } = await idx.start();
// nextStep.inputs = [{ name: 'username', ... }, { name: 'password', ... }]
const { status } = await idx.proceed({username: 'foo', password: 'bar'});
// status = IdxStatus.SUCCESS
```
  
> The `authn` API is still supported. IDX is _not_ a drop-in replacement for `authn`. It's a more sophisticated protocol. Both APIs can be used to build authencation flows. However if you're looking to ultitize features of [OIE](https://developer.okta.com/docs/concepts/ie-intro/), like passwordless authentication, you'll have to build on top of IDX

## Getting Started

The first step is to enable the [Okta Identity Engine](https://developer.okta.com/docs/concepts/ie-intro/) on your Okta organization. If your organization does not have the [Okta Identity Engine](https://developer.okta.com/docs/concepts/ie-intro/) enabled, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

The [IDX API](./idx.md) can be accessed using the `@okta/okta-auth-js` module. We recommend upgrading to the latest available version. See detail in [Using the npm module](../README.md#using-the-npm-module).

## Configuration

`IDX` applications must use the [PKCE OAuth 2.0 flow](../README.md#pkce-oauth-20-flow). In addition to `issuer`, you must specify a `clientId` and `redirectUri` in your config. (`pkce` is enabled by default). A minimal config for a SPA application looks like:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://{yourAppDomain}/login/callback',
};

var authClient = new OktaAuth(config);
```

Server-side web applications must also provide a [clientSecret](../README.md#clientsecret).

## Transaction Models

### AuthN

Entrypoint methods in the `authn` API, such as [signInWithCredentials](authn.md#signinwithcredentialsoptions) and [forgotPassword](authn.md#forgotpasswordoptions) return a `Transaction` object which has a [status](authn.md#transactionstatus) field and various [methods](authn.md#common-methods) to proceed or cancel the transaction.

Basic authentication using `authn` API:

```javascript
const transaction = await authClient.signInWithCredentials({
  username: 'some-username',
  password: 'some-password'
});

if (transaction.status === 'SUCCESS') {
  authClient.session.setCookieAndRedirect(transaction.sessionToken); // Sets a cookie on redirect
}

// App will receive tokens on redirect
```
### IDX

Methods in the `IDX` API return an `IdxTransaction` object which also includes a [status](idx.md#status) field. If the transaction was successful and no further action is required, this value will be `IdxStatus.SUCCESS`. If the value is `IdxStatus.PENDING`, then some further action is required. Unlike the `authn` `Transaction` object, the `IdxTransaction` object does not include methods to proceed or cancel the transaction, these methods are exposed via the `idx` namespace (`authClient.idx.proceed` and `authClient.idx.cancel`). 

Basic authentication using `IDX` API:
```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'username', ... }, { name: 'password', ... }]
  }
} = await authClient.idx.start();

const { 
  status // IdxStatus.SUCCESS
} = await authClient.idx.proceed({ username: 'xxx',  password: 'xxx' });
```

 > Optionally, form values can be passed "up front". This may result in multiple network calls to the IDX API

Basic authentication using `IDX` API (up-front approach):

```javascript
const { status } = await authClient.idx.start({ 
  username: 'some-username',
  password: 'some-password',
});
// status = IdxStatus.SUCCESS
```

## IDX Transaction
> For more details, check the [type](https://github.com/okta/okta-auth-js/blob/master/lib/idx/types/api.ts#L95)

The primary goal of any IDX transaction is to authenticated a user. The `nextStep` field will contain the form necessary to continue on the current "path".

```
start();                                  // nextStep: username
proceed({username: 'user@foo.com'});      // nextStep: password
proceed({password: '12345});
```

Sometimes users need to complete an additonal step before authenticating, like signing up (registration) or unlocking their account. The `availableSteps` field contains all available "paths" a user can proceed down as of their current step. The value of `availableSteps` is largely dictated by your Okta Org (OIE) Policies. For example: for [Self-service registration](https://help.okta.com/oie/en-us/Content/Topics/identity-engine/policies/about-ssr.htm) to be an avaiable path, it will need to be enabled in your Org settings

```javscript
{
  status,           // ENUM [PENDING, SUCCESS, FAILURE, TERMINAL, CANCELED]

  nextStep,         // { inputs: [], ... }

  availableSteps    // [{ inputs: [], ... }, { inputs: [], ... }, ...]

  messages,         // describes errors, if any have occured
```

## Implementing IDK

Standard IDX flows should use `idx.start` and `idx.proceed`. However these methods will allow the user to step into all available paths. This makes sense if you're developing something similar to the Okta [SignIn Widget](#https://github.com/okta/okta-signin-widget), but may not make sense in all cases. For example, if you're building a dedicated registration page, you may not want to the user to step into the account unlock path. To solve this, all `idx` methods accept a `flow` parameter. Setting `flow` restricts the paths the SDK will step into, preventing the user from entering an unexpected path.

> For more details, see [IDX Flow](./idx.md#flow)

For convenience, `idx` has a few `entry point` methods which will set the `flow` param (listed below)

## Authn to IDX Conversion Chart

> Note: These are _not_ a 1-1 mapping. These IDX entry points are used to enter a specific flow

| authn | IDX |
| ----  | ---- |
| [signInWithCredentials](#signinwithcredentialsoptions) | [idx.authenticate](idx.md#idxauthenticate) |
| [forgotPassword](#forgotpasswordoptions) | [idx.recoverPassword](#idxrecoverpassword) |
| [unlockAccount](#unlockaccountoptions) | [idx.unlockAccount](idx.md#idxunlockaccount) | [idx.recoverPassword](#idxrecoverpassword)  |
| [verifyRecoveryToken](#verifyrecoverytokenoptions) | `idx.start({ recoveryToken })` |
| [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi) | N/A |
| [transaction.cancel](#cancel) | [idx.cancel](#idxcancel) |

## Handling Errors

Errors will be returned on the [IdxTransaction](idx.md#response) object.

If the `status` field has a value of `IdxStatus.FAILURE`, this indicates an SDK-level error, such as application mis-configuration. In this case, check the [error field](idx.md#error) on the transaction for more details.

If the `status` field has a value of `IdxStatus.TERMINAL`, this indicates the flow has run into a `terminal` state, check the [messages field](idx.md#messages) to handle it.

## Helpful Information and Resources

- [Okta Identity Engine](https://developer.okta.com/docs/concepts/ie-intro/)
- [OIE code samples](https://developer.okta.com/code/oie/)
- [Sample: Express embedded auth](../samples/generated/express-embedded-auth-with-sdk/)
- [Sample: React embedded auth](../samples/generated/react-embedded-auth-with-sdk/)
