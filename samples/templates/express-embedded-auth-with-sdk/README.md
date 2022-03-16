{{> identity-engine/links.md }}

# Embedded Auth with SDKs Sample Application

## Introduction

> :grey_exclamation: The use of this Sample uses an SDK that requires usage of the Okta Identity Engine. This functionality is in general availability but is being gradually rolled out to customers. If you want
to request to gain access to the Okta Identity Engine, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

This Sample Application will show you the best practices for integrating Authentication into your app
using [Okta's Identity Engine][]. Specifically, this application will cover some basic needed use cases to get you up and running quickly with Okta.
These Examples are:

1. Sign In
2. Sign Out
3. Sign Up
4. Sign In/Sign Up with Social Identity Providers
5. Sign In with Multifactor Authentication using Email or Phone

{{! For information and guides on how to build your app with this sample, please take a look at the [ExpressJS guides for Embedded Authentication][] }}

## Installation & Running The App

{{> identity-engine/setup.md }}

### Commands

If running from the workspace directory: `yarn workspace {{name}} start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |

{{! To see some examples for use cases using this sample application, please take a look at the [ExpressJS guides for Embedded Authentication][] }}

## Implementation Details

This sample app follows classic ExpressJS routing structure and uses [mustache-express](https://www.npmjs.com/package/mustache-express) as the view engine. Below is how the specific scenarios map the routes:

* Sign In Flow -> [routes/login.js](./web-server/routes/login.js)

* Self Service Registration -> [routes/register.js](./web-server/routes/register.js)

* Self Service Password Recovery ->  [routes/recover-password.js](./web-server/routes/recover-password.js)

* Multifactor -> [routes/authenticators.js](./web-server/routes/authenticators.js)

* Logout -> [routes/logout.js](./web-server/routes/logout.js)

{{> identity-engine/custom-storage-provider.md }}

### Centralized transaction (idxStates) handler

The [Okta's Identity Engine][] is a state machine, it responses different states based on the request. To handle the complex response states, a centralized transaction handler pattern is introduced in this sample. It handles the response based on [transaction.status](https://github.com/okta/okta-auth-js/blob/master/docs/idx.md#status), then dispatches the requests to proper routes based on [transaction.nextStep](https://github.com/okta/okta-auth-js/blob/master/docs/idx.md#nextstep).

See implementation details in [handleTransaction.js](./web-server/utils/handleTransaction.js).
