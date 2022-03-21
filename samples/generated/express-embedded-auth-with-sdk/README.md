[Okta's Identity Engine]: https://developer.okta.com/docs/concepts/ie-intro/
[Okta Auth JS]: https://github.com/okta/okta-auth-js

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


## Installation & Running The App

If you haven't done so already, register for a free account at [developer.okta.com](https://developer.okta.com/). Select **Create Free Account** and fill in the forms to complete the registration process. Once you are done and logged in, you will see your Okta Developer Console.

> **Tip**: You can also create an account using the [Okta CLI](https://github.com/oktadeveloper/okta-cli) and `okta register`. To create an app, run `okta apps create` and use the settings below.

Register your application by selecting **Applications** > **Add Application**. On the next screen, choose **Web App** and click **Next**.

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
CLIENT_SECRET=456xxx
```

### Commands

If running from the workspace directory: `yarn workspace @okta/samples.express-embedded-auth-with-sdk start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |


## Implementation Details

This sample app follows classic ExpressJS routing structure and uses [mustache-express](https://www.npmjs.com/package/mustache-express) as the view engine. Below is how the specific scenarios map the routes:

* Sign In Flow -> [routes/login.js](./web-server/routes/login.js)

* Self Service Registration -> [routes/register.js](./web-server/routes/register.js)

* Self Service Password Recovery ->  [routes/recover-password.js](./web-server/routes/recover-password.js)

* Multifactor -> [routes/authenticators.js](./web-server/routes/authenticators.js)

* Logout -> [routes/logout.js](./web-server/routes/logout.js)

### Custom storage provider

As this sample app is implemented to support multiple users scenario, a custom storage provide will be needed to inject to the [authClient][Okta Auth JS] to proper store the transaction meta and tokens. In this sample, it leverages [express-session](https://www.npmjs.com/package/express-session) to store data based on the transactionId.

See implementation details in [getAuthClient.js](./web-server/utils/getAuthClient.js) and [Auth JS storageProvider](https://github.com/okta/okta-auth-js#storageprovider).

### Centralized transaction (idxStates) handler

The [Okta's Identity Engine][] is a state machine, it responses different states based on the request. To handle the complex response states, a centralized transaction handler pattern is introduced in this sample. It handles the response based on [transaction.status](https://github.com/okta/okta-auth-js/blob/master/docs/idx.md#status), then dispatches the requests to proper routes based on [transaction.nextStep](https://github.com/okta/okta-auth-js/blob/master/docs/idx.md#nextstep).

See implementation details in [handleTransaction.js](./web-server/utils/handleTransaction.js).
