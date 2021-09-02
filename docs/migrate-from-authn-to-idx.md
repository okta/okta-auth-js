<!-- omit in toc -->
# Migrating from authn to IDX

The [IDX API](./idx.md) is built on the [Okta Identity Engine][]. The API allows applications to implement features which were not possible with the older [authn API](./authn.md), such as multi-factor authentication without redirection to Okta. We recommend that all new application deployments use the `IDX` API. Existing applications using `authn` can migrate to `IDX` by following this guide.

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [New Methods](#new-methods)
- [Transaction Model](#transaction-model)
- [Handling Errors](#handling-errors)
- [Basic Example](#basic-example)
- [Helpful Information and Resources](#helpful-information-and-resources)
  
## Getting Started

The first step is to enable the [Okta Identity Engine][] on your Okta organization. If your organization does not have the [Okta Identity Engine][] enabled, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

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

## New Methods

The following table shows a mapping of `authn` methods and the corresponding method (if any) in the `IDX` API.

| authn | IDX |
| ----  | ---- |
| [signInWithCredentials](#signinwithcredentialsoptions) | [idx.authenticate](idx.md#idxauthenticate) |
| [forgotPassword](#forgotpasswordoptions) | [idx.recoverPassword](#idxrecoverpassword) |
| [unlockAccount](#unlockaccountoptions) | N/A |
| [verifyRecoveryToken](#verifyrecoverytokenoptions) | N/A |
| [session.setCookieAndRedirect](#sessionsetcookieandredirectsessiontoken-redirecturi) | N/A |
| [transaction.cancel](#cancel) | [idx.cancel](#idxcancel) |

## Transaction Model

Entrypoint methods in the `authn` API, such as [signInWithCredentials](#signinwithcredentialsoptions) and [forgotPassword](#forgotpasswordoptions) return a `Transaction` object which has a [status](#transactionstatus) field and various [methods](#common-methods) to proceed or cancel the transaction.  Methods in `IDX` API, such as [idx.authenticate](idx.md#idxauthenticate) and [idx.recoverPassword](#idxrecoverpassword) return an `IdxTransaction` object which also includes a [status](idx.md#status) field. If the transaction was successful and no further action is required, this value will be `IdxStatus.SUCCESS`. If the value is `IdxStatus.PENDING`, then some further action is required. The [nextStep](idx.md#nextstep) field will indicate which values are needed to continue the flow.

## Handling Errors

Errors will be returned on the [IdxTransaction](idx.md#response) object.

If the `status` field has a value of `IdxStatus.FAILURE`, this indicates an SDK-level error, such as application mis-configuration. In this case, check the [error field](idx.md#error) on the transaction for more details.

If the `status` field has a value of `IdxStatus.TERMINAL`, this indicates the flow has run into a `terminal` state, check the [messages field](idx.md#messages) to handle it.

## Basic Example

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

Basic authentication using `IDX` API:

```javascript
const transaction = await authClient.idx.authenticate({ 
  username: 'some-username',
  password: 'some-password',
});

if (transaction.status === IdxStatus.SUCCESS) {
  authClient.tokenManager.setTokens(transaction.tokens); // App receives tokens directly
}
```

## Helpful Information and Resources

- [Okta Identity Engine][]
- [OIE code samples](https://developer.okta.com/code/oie/)
- [Sample: express embedded auth](../samples/generated/express-embedded-auth-with-sdk/)
