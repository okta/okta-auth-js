# Embedded Auth with SDKs React Sample Application

## Introduction

> :grey_exclamation: The use of this Sample uses an SDK that requires usage of the Okta Identity Engine. This functionality is in general availability but is being gradually rolled out to customers. If you want
to request to gain access to the Okta Identity Engine, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

This Sample Application will show you the best practices for integrating Authentication and Profile management into your app
using [Okta's Identity Engine][]. Specifically, this application will cover some basic needed use cases to get you up and running quickly with Okta.

## Installation & Running The App

If you haven't done so already, register for a free account at [developer.okta.com](https://developer.okta.com/). Select **Create Free Account** and fill in the forms to complete the registration process. Once you are done and logged in, you will see your Okta Developer Console.

> **Tip**: You can also create an account using the [Okta CLI](https://github.com/oktadeveloper/okta-cli) and `okta register`. To create an app, run `okta apps create` and use the settings below.

Register your application by selecting **Applications** > **Add Application**. On the next screen, choose **SPA App** and click **Next**.

On the following screen, edit the application settings. For ExpressJS applications running in developer mode, the port number should be 8080. Configure your app as follows:

* **Initiate Login URI**: `http://localhost:8080`
* **Login redirect URI**: `http://localhost:8080/login/callback`
* **Logout redirect URI**: `http://localhost:8080`

By default the app server runs at `http://localhost:8080`.

Once you have completed the form, edit the app settings by selecting `Interaction Code` in the **Application** section (please contact Okta Support if the feature is not avaiable in your org). With the application set up, you will be given **client ID** and **client secret**. You will also need the **issuer** value for your Okta org.

The **issuer** is the URL of the authorization server that will perform authentication.  All Developer Accounts have a "default" authorization server.  The issuer is a combination of your Org URL (found in the upper right of the console home page) and `/oauth2/default`. For example, `https://dev-133337.okta.com/oauth2/default`.

These values must exist as environment variables. They can be exported in the shell, or saved in a file named `testenv`, located in the root level of the sample project. See [dotenv](https://www.npmjs.com/package/dotenv) for more details on this file format.

```ini
ISSUER=https:///oauth2/default
CLIENT_ID=123xxxxx123
```

### Commands

If running from the workspace directory: `yarn workspace @okta/samples.react-embedded-auth-with-sdk start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server          |


### Supported Features

#### Authentication

This sample app demonstrates the best practices for integrating Authentication into your React SPA via the embedded Auth SDK (@okta/okta-auth-js). It dynamically renders the form by following responses from [Okta's Identity Engine][]. Policy changes, like adding extra authenticator for MFA, can be reflected in this sample app with no code change.

#### Profile Management

MyAccount API provides user-scoped endpoints that don’t require admin tokens, which means profile management process can be finished within a single page app and end users only need an active user session to update their email and phone authenticators.

[MyAccount Scopes](/docs/myaccount/README.md#scopes) will be needed at top level [config](/README.md#configuration-reference) of @okta/okta-auth-js to acquire scoped tokens after authentication.
