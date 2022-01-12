[Okta's Identity Engine]: https://developer.okta.com/docs/concepts/ie-intro/
[Okta Sign-In Widget]: https://github.com/okta/okta-signin-widget
[Embedded auth with SDKs]: https://github.com/okta/okta-auth-js/tree/master/samples/generated/express-direct-auth

<!-- omit in toc -->
# IDX

- [Introduction](#introduction)
- [Migrating from authn](#migrating-from-authn)
- [Installation](#installation)
- [Usage](#usage)
  - [Concepts](#concepts)
    - [Flow](#flow)
      - [Flow Entrypoints](#flow-entrypoints)
    - [Redirect Callbacks](#redirect-callbacks)
      - [OAuth callback](#oauth-callback)
      - [Social/IDP callback](#socialidp-callback)
      - [Email verify callback](#email-verify-callback)
    - [Approaches](#approaches)
      - [Up-Front approach](#up-front-approach)
      - [On-Demand approach](#on-demand-approach)
    - [Response](#response)
      - [Flow related fields](#flow-related-fields)
        - [`status`](#status)
        - [`nextStep?`](#nextstep)
        - [`tokens?`](#tokens)
        - [`messages?`](#messages)
        - [`error?`](#error)
      - [Start Transaction related fields](#start-transaction-related-fields)
        - [`meta?`](#meta)
        - [`enabledFeatures?`](#enabledfeatures)
        - [`availableSteps?`](#availablesteps)
  - [API Reference](#api-reference)
    - [`idx.authenticate`](#idxauthenticate)
    - [`idx.register`](#idxregister)
    - [`idx.recoverPassword`](#idxrecoverpassword)
    - [`idx.start`](#idxstart)
    - [`idx.startTransaction`](#idxstarttransaction)
    - [`idx.cancel`](#idxcancel)
    - [`idx.proceed`](#idxproceed)
    - [`idx.canProceed`](#idxcanproceed)
    - [`idx.poll`](#idxpoll)
    - [`idx.getFlow`](#idxgetflow)
    - [`idx.setFlow`](#idxsetflow)
    - [`idx.handleInteractionCodeRedirect`](#idxhandleinteractioncoderedirect)

## Introduction

> :grey_exclamation: The use of this module requires usage of the Okta Identity Engine. This functionality is in general availability but is being gradually rolled out to customers. If you want to request to gain access to the Okta Identity Engine, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

This module is built to communicate with Okta as an OAuth 2.0 + OpenID Connect provider. It works with [Okta's Identity Engine][] to authenticate and register users.

To see this library working in a sample, check out our [Embedded auth with SDKs][] sample.

## Migrating from authn

The [IDX API](./idx.md) is built on the [Okta Identity Engine][]. The API allows applications to implement features which were not possible with the older [authn API](./authn.md), such as multi-factor authentication without redirection to Okta. We recommend that all new application deployments use the `IDX` API. Existing applications can migrate from `authn` to `IDX` by following [this guide](./migrate-from-authn-to-idx.md).

## Installation

See detail in [Using the npm module](../README.md#using-the-npm-module).

## Usage

This module provides convenience methods to support popular scenarios to communicate with [Okta's Identity Engine][].

### Concepts

#### Flow

In addition to the default authentication flow, this SDK supports several pre-defined flows, such as [register](#idxregister) and [recoverPassword](#idxrecoverpassword). A flow can be started by calling one of the available [flow entrypoints](#flow-entrypoints) or by passing a valid flow identifier string to [`startTransaction`](#idxstarttransaction). The `flow` is saved with the transaction which enables the [proceed](#idxproceed) method to corrrectly handle remediations without additional context. Starting a new flow discards any existing in-progress transaction of a different type. For example, if an authentication flow is in-progress, a call to [authenticate](#idxauthenticate) or [proceed](#idxproceed) will continue using the current transaction but a call to [register](#idxregister) or [recoverPassword](#idxrecoverpassword) will start a new transaction.

```javascript

// a recover password flow can be started by calling the `recoverPassword` entrypoint
await authClient.idx.recoverPassword();
const flow = authClient.idx.getFlow(); // "recoverPassword"

// or by passing the flow identifier to `startTransaction`
await authClient.idx.startTransaction({ flow: 'recoverPassword' })

```

##### Flow Entrypoints

The [flow](#flow) is set automatically when calling one of these methods:

- [`idx.authenticate`](#idxauthenticate)
- [`idx.register`](#idxregister)
- [`idx.recoverPassword`](#idxrecoverpassword)

The `flow` will be set to `default` unless otherwise specified in [`idx.startTransaction`](#idxstarttransaction)

#### Redirect Callbacks

A redirect callback occurrs when your app is reloaded in the browser as part of a [flow](#flow).
During a redirect callback, the app is loaded at a specific URL path that you have defined in your Okta App configuration. Most callbacks can only be handled once and will produce an error if there is an attempt to handle it twice. Typically, the app will redirect itself to a well known or previously saved URL path after the callback logic has been handled to avoid errors on page reload.

> **Note:** Most apps should be prepared to handle one or more redirect callbacks. Depending on how the App sign-on policy is configured, some SPA applications may be able to receive tokens without any redirect. However, logic will need to be added if the policy includes signing in with a [Social / IDP provider)](#socialidp-callback)) or allows [account recovery using email](#email-verify-callback).  

##### OAuth callback

All web applications will handle an OAuth callback which includes an `interaction_code` query parameter. SPA applications can receive an `interactionCode` directly from an IDX [Response](#response). However, they may still need to implement OAuth callback logic if the sign-on policy includes signing in with a [Social / IDP provider](#socialidp-callback).

```javascript
// https://myapp.mycompany.com/login/callback?interaction_code=ABC&state=XYZ
if (authClient.isLoginRedirect()) {
  await authClient.handleLoginRedirect();
}
```

##### Social/IDP callback

After signing in with a 3rd party IDP, the user is redirected back to the application. If no further input is needed from the user, then this will be an [OAuth callback](#oauth-callback) containing an `interaction_code` parameter. If further input is required, then the callback will contain an `error` parameter with the value `interaction_required`

```javascript
const search = window.location.search;
if (authClient.idx.isInteractionRequired(search)) {
  await authClient.idx.proceed();
}
```

##### Email verify callback

After the user clicks the link in an email, they are redirected back to the application. The query parameters include `state` and `otp`

```javascript
const { search } = window.location;
if (authClient.idx.isEmailVerifyCallback(search)) {
  try {
    // Proceed, if possible. Throws an `EmailVerifyCallbackError` if proceed is not possible.
    const { status, nextStep, tokens } = await authClient.idx.handleEmailVerifyCallback(search);
    if (status === IdxStatus.SUCCESS) {
      // user has successfully authenticated
      authClient.tokenManager.setTokens(tokens);
    } else {
      // follow nextStep to see what is needed to proceed
    }
  } catch (e) {
    if (authClient.idx.isEmailVerifyCallbackError(e)) {
      const { otp, state } = e;
      // you can add special handling for the email verify callback error
      // by default it will have a message that says
      // `Enter the OTP code in the originating client: ${otp}`
    }
    console.log(e.message);
  }
}
```

#### Approaches

You can work with these methods with `Up-Front` and `On-Demand` approaches, normally a mix of both approaches will be needed when user inputs are required in the middle of the flow (e.g. multiple factors auth). Below are the general explanation of these two approaches, more code examples will be provided with the specific methods.

##### Up-Front approach

You can provide parameters based on your app's policy configuration and user inputs to drive the methods to communicate with [Okta's Identity Engine][].

##### On-Demand approach

You can provide minimum or even no parameters to call the methods, and the methods can provide direction for the flow by indicating the `nextStep` and required `inputs`.

#### Response

Most methods in this module resolve [IdxTransaction](https://github.com/okta/okta-auth-js/blob/master/lib/idx/types/index.ts) as the response. With [Okta's Identity Engine][]'s dynamic nature, it's very important to understand how to follow the response to proceed to the next step.

##### Flow related fields

###### `status`

This field indicates the status of the current flow.

- `IdxStatus.SUCCESS`: This status indicates the flow has ended successfully with tokens.
- `IdxStatus.PENDING`: This status indicates the flow is still in progress, check `nextStep` and `messages` (intermediate form errors) fields in the response to proceed.
- `IdxStatus.FAILURE`: This status indicates error has happened in SDK level, check `error` field in the response for error handling.
- `IdxStatus.TERMINAL`: This status indicates the flow has run into a `terminal` state, check `messages` field to handle it.
- `IdxStatus.CANCELED`: This status indicates the flow has been canceled. It's normally the response status of `idx.cancel`.

###### `nextStep?`

This field contains information to proceed with the next step. It's avaiable when in `IdxStatus.PENDING` status.

- `name`: The identifier of the next step.
- `type?`: The type of the authenticator that the step belongs to.
- `authenticator?`: The authenticator that the step belongs to.
- `canSkip?`: This field indicates if the step is skippable or not.
- `inputs?`: parameters for the next step.

  ```javascript
  // get "inputs" from the response
  // inputs: [{ name: 'username', label: 'Username' }]
  const { nextStep: { inputs } } = await authClient.idx.authenticate();
  // gather user inputs (this call should happen in a separated request)
  const transaction = await authClient.idx.authenticate({ username: 'from user input' });
  ```

- `options?`: This field is available in response when the input is a selection. It can also provide information for how to build UI for the next step.

###### `tokens?`

It's available with `IdxStatus.SUCCESS` status. Provides tokens set based on [scopes](../README.md#scopes) configuration.

###### `messages?`

It passes back messages from [Okta's Identity Engine][]. `Form message` and `Terminal message` both come to this field.

###### `error?`

It's avaialbe with `IdxStatus.FAILURE` status when the SDK run into unhandlable state.

##### Start Transaction related fields

###### `meta?`

It provides transaction meta (pkce meta, interactionHandle, etc.).

###### `enabledFeatures?`

It indicates what features are available based on the app / org policy configuration.

###### `availableSteps?`

It provides information for avaiable next steps.

### API Reference

#### `idx.authenticate`

The convenience method for starting an `authentication` flow.

Example (Two factors auth with email authenticator):

**Up-Front**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: {
    inputs // [{ name: 'verificationCode', ... }]
  } 
} = await authClient.idx.authenticate({ 
  username: 'xxx',
  password: 'xxx',
  authenticators: [AuthenticatorKey.OKTA_EMAIL /* 'okta_email' */]
});
// submit verification code from email
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.proceed({ verificationCode: 'xxx' });
```

**On-Demand**:

```javascript
// start the flow with no param
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'username', ... }, { name: 'password', ... }]
  }
} = await authClient.idx.authenticate();
// gather user inputs
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }]
    options // [{ name: 'email', ... }, ...]
  }
} = await authClient.idx.proceed({ username: 'xxx',  password: 'xxx' });
// a list of authenticators is shown and the user selects "email"
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'verificationCode', ... }]
  }
} = await authClient.idx.proceed({ authenticator: AuthenticatorKey.OKTA_EMAIL /* 'okta_email' */ });
// gather verification code from email (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.proceed({ verificationCode: 'xxx' });
```

#### `idx.register`

The convenience method for starting a `self service registration` flow.

Example (Registration with password authenticator enrollment)

**Up-Front**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'password', ... }]
  }
} = await authClient.idx.register({ 
  firstName: 'xxx',
  lastName: 'xxx',
  email: 'xxx',
  authenticators: [AuthenticatorKey.OKTA_PASSWORD /* 'okta_password' */]
});
// submit password
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.proceed({ password: 'xxx' });
```

**On-Demand**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'firstName', ... }, { name: 'lastName', ... }, { name: 'email', ... }]
  }
} = await authClient.idx.register();
// submit user inputs and select password authenticator
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }]
    options // [{ name: 'password', ... }, ...]
  } 
} = await authClient.idx.proceed({
  firstName: 'xxx',
  lastName: 'xxx',
  email: 'xxx',
  authenticator: 'password'
});
// select authenticator (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'password', ... }]
  }
} = await authClient.idx.proceed({ authenticator: AuthenticatorKey.OKTA_PASSWORD /* 'okta_password' */ });
// gather password from user input (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.proceed({ password: 'xxx' });
```

**Account activation**:

```js
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.register({
  activationToken: 'xxxxx',
  authenticator: 'okta_password',
  password: 'xxx'
});
```

#### `idx.recoverPassword`

The convenience method for starting a `self service password recovery` flow. See [Email Verify Callback](#email-verify-callback) for more detailed information on this flow.

Example (Password recovery with email authenticator verification)

**Up-Front**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'verificationCode', ... }]
  }
} = await authClient.idx.recoverPassword({
  username: 'xxx',
  authenticators: [AuthenticatorKey.OKTA_EMAIL /* 'okta_email' */]
});
// submit verification code
const { 
  status,  // IdxStatus.PENDING
  nextStep: {
    inputs // [{ name: 'password', ... }]
  }
} = await authClient.idx.proceed({ verificationCode: 'xxx' });
// submit new password
const { 
  status,  // IdxStatus.SUCCESS
  tokens
} = await authClient.idx.proceed({ password: 'xxx' });
```

**On-Demand**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'username', ... }]
  } 
} = await authClient.idx.recoverPassword();
// gather username from user input 
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }] 
    options // [{ name: 'email', ... }, ...]
  } 
} = await authClient.idx.proceed({ username });
// user sees a list of authenticators and selects "email"
const { 
  status, // IdxStatus.PENDING
  nextStep: {
    inputs // [{ name: 'verificationCode', ... }]
  } 
} = await authClient.idx.proceed({ authenticator: AuthenticatorKey.OKTA_EMAIL /* 'okta_email' */ });
// gather verification code from email (this call should happen in a separated request)
const { 
  status, 
  nextStep: {
    inputs // [{ name: 'password', ...}]
  }
} = await authClient.idx.proceed({ verificationCode: 'xxx' });
// submit new password
const { 
  status, // IdxStatus.SUCCESS 
  tokens
} = await authClient.idx.proceed({ password: 'xxx' });
```

#### `idx.start`

Alias for [idx.startTransaction](#idxstarttransaction)

#### `idx.startTransaction`

Resolves [Start Transaction related fields](#start-transaction-related-fields).

Popular use cases:

- Single entry point when the [flow][] is dynamic
- Provides `meta` for [Okta Sign-In Widget][] integration.
- Provides `enabledFeatures` and `availableSteps` for dynamic UI rendering.

```javascript

// start a recoverPassword transaction
await authClient.idx.startTransaction({ flow: 'recoverPassword' })

```

#### `idx.cancel`

Cancels the in progress idx interaction transaction.

```javascript
await authClient.idx.cancel();
```

#### `idx.proceed`

Continues an in-progress idx transaction. If there is no saved transaction, this method will throw. To check for the existence of an in-progress idx transaction, use `idx.canProceed`. When provided with `{step: stepName}`, continues transaction at specified remediation (step).

```javascript
if (authClient.idx.canProceed()) {
  await authClient.idx.proceed();
}
```
#### `idx.canProceed`

Returns true if there is a saved in-progress idx transaction. To test against shared browser storage, pass `state`.

```javascript
 // checks against sessionStorage, can only proceed in same tab
authClient.idx.canProceed();

// will check against shared localStorage, allows proceeding in another tab if the state matches
authClient.idx.canProceed({ state });
```

#### `idx.poll`

Resumes saved transaction and fires poll request to Okta API. Performs single poll request by default. Front-end clients can pass `{ refresh: millisecondsInt` } parameter, which enables polling to continue until it is considered complete by server or session times out. `refresh` value is available through the `nextStep` property of in-progress transaction.

```javascript
let idxTransaction = await authClient.idx.register();
// ...
// render view that matches current IDX stage
// ...
const pollOptions = idxTransaction?.nextStep?.poll;
if (pollOptions.required) {
  authClient.idx.poll(pollOptions.refresh).then(pollResult => {
    // render view matching poll result
  });
}
```

#### `idx.getFlow`

Returns the identifier for the currently configured [flow](#flow).

```javascript
const flow: FlowIdentifier = authClient.idx.getFlow();
```

#### `idx.setFlow`

The `flow` is usually set automatically when calling one of the [flow entrypoints](#flow-entrypoints) or [startTransaction](#idxstarttransaction). This method can be used to manually set the `flow`:

```javascript
authClient.idx.setFlow('register');
```

#### `idx.handleInteractionCodeRedirect`

Handles `interaction_code` from [Okta's Identity Engine][]'s callback url. It exchanges the code for tokens and saves them in storage.

```javascript
try {
  // handle interactionCode and save tokens
  await authClient.idx.handleInteractionCodeRedirect(callbackUrl);
} catch (err) {
  if (authClient.idx.isInteractionRequiredError(err)) {
    // need to proceed with required authenticator/s
  }
  throw err;
}
```
