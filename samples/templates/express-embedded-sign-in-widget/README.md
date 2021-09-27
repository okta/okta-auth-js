{{> identity-engine/links.md }}
[Okta Sign In Widget]: https://github.com/okta/okta-signin-widget

# Embedded Sign In Widget Sample Applications

## Introduction

> :grey_exclamation: The use of this Sample uses an SDK that requires usage of the Okta Identity Engine. This functionality is in general availability but is being gradually rolled out to customers. If you want
to request to gain access to the Okta Identity Engine, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

This Sample Application will show you the best practices for integrating Authentication by embedding the [Okta Sign In Widget][] into your application. The [Okta Sign In Widget][] is powered by [Okta's Identity Engine][] and will adjust your user experience based on policies. Once integrated, you will be able to utilize all the features of Okta's Sign In Widget in your application.

{{! For information and guides on how to build your app with this sample, please take a look at the [ExpressJS guides for Embedded Authentication][] }}

## Installation & Running The App

{{> identity-engine/setup.md }}

### Commands

If running from the workspace directory: `yarn workspace {{pkgName}} start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |

{{! To see some examples for use cases using this sample application, please take a look at the [ExpressJS guides for Embedded Authentication][] }}

## Implementation Details

This sample app follows classic ExpressJS routing structure and uses [mustache-express](https://www.npmjs.com/package/mustache-express) as the view engine. Below is how the specific scenarios map the routes:

* Sign In Widget Integration -> [routes/login.js](./web-server/routes/login.js)

* Logout -> [routes/logout.js](./web-server/routes/logout.js)

{{> identity-engine/custom-storage-provider.md }}
