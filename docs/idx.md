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
    - [`idx.startTransaction`](#idxstarttransaction)
    - [`idx.cancel`](#idxcancel)
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

#### Approaches

You can work with these methods with `Up-Front` and `On-Demand` approaches, normally a mix of both approaches will be needed when user inputs are required in the middle of the flow (e.g. multiple factors auth). Below are the general explaination of these two approaches, more code examples will be provided with the specific methods.

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
- `currentAuthenticator?`: The authenticator that the step belongs to.
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

The convenience method for `authentication` flow.

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
  authenticators: ['email']
});
// gather verification code from email (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.authenticate({ verificationCode: 'xxx' });
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
// gather user inputs (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }]
    options // [{ name: 'email', ... }, ...]
  }
} = await authClient.idx.authenticate({ username: 'xxx',  password: 'xxx' });
// select authenticator (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'verificationCode', ... }]
  }
} = await authClient.idx.authenticate({ authenticator: 'email' });
// gather verification code from email (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.authenticate({ verificationCode: 'xxx' });
```

#### `idx.register`

The convenience method for `self service registration` flow.

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
  authenticators: ['password']
});
// gather password from user input (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.register({ password: 'xxx' });
```

**On-Demand**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'firstName', ... }, { name: 'lastName', ... }, { name: 'email', ... }]
  }
} = await authClient.idx.register();
// gather user inputs (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }]
    options // [{ name: 'password', ... }, ...]
  } 
} = await authClient.idx.register({
  firstName: 'xxx',
  lastName: 'xxx',
  email: 'xxx'
});
// select authenticator (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'password', ... }]
  }
} = await authClient.idx.register({ authenticator: 'password' });
// gather password from user input (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS
  tokens 
} = await authClient.idx.register({ password: 'xxx' });
```

#### `idx.recoverPassword`

The convenience method for `self service password recovery` flow.

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
  authenticators: ['email']
});
// gather password from user input (this call should happen in a separated request)
const { 
  status,  // IdxStatus.PENDING
  nextStep: {
    inputs // [{ name: 'password', ... }]
  }
} = await authClient.idx.recoverPassword({ verificationCode: 'xxx' });
// gather verification code from email (this call should happen in a separated request)
const { 
  status,  // IdxStatus.SUCCESS
  tokens
} = await authClient.idx.recoverPassword({ password: 'xxx' });
```

**On-Demand**:

```javascript
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs // [{ name: 'username', ... }]
  } 
} = await authClient.idx.register();
// gather username from user input (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: { 
    inputs, // [{ name: 'authenticator', ... }] 
    options // [{ name: 'email', ... }, ...]
  } 
} = await authClient.idx.register({ username });
// select authenticator (this call should happen in a separated request)
const { 
  status, // IdxStatus.PENDING
  nextStep: {
    inputs // [{ name: 'verificationCode', ... }]
  } 
} = await authClient.idx.register({ authenticator: 'email' });
// gather verification code from email (this call should happen in a separated request)
const { 
  status, 
  nextStep: {
    inputs // [{ name: 'password', ...}]
  }
} = await authClient.idx.register({ verificationCode: 'xxx' });
// gather new password from user input (this call should happen in a separated request)
const { 
  status, // IdxStatus.SUCCESS 
  tokens
} = await authClient.idx.register({ password: 'xxx' });
```

#### `idx.startTransaction`

Resolves [Start Transaction related fields](#start-transaction-related-fields).

Popular use cases:

- Provides `meta` for [Okta Sign-In Widget][] integration.
- Provides `enabledFeatures` and `availableSteps` for dynamic UI rendering.

#### `idx.cancel`

Cancels the in progress idx interaction transaction.

```javascript
await authClient.idx.cancel();
```

#### `idx.handleInteractionCodeRedirect`

Handles `interaction_code` from [Okta's Identity Engine][]'s callback url. It exchanges the code for tokens and saves them in storage.

```javascript
try {
  // handle interactionCode and save tokens
  await authClient.idx.handleInteractionCodeRedirect(callbackUrl);
} catch (err) {
  if (authClient.isInteractionRequiredError(err)) {
    // need to proceed with required authenticator/s
  }
  throw err;
}
```
