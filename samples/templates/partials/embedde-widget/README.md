[sessionToken]: https://developer.okta.com/docs/reference/api/sessions/#session-token
[signIn]: https://github.com/okta/okta-auth-js#signinoptions

# {{ name }} sample

> :warning: This sample depends on `OIE` features which are still in EARLY ACCESS, please contact Okta Support for how to turn on the feature in your org.

This sample demonstrates using `@okta/okta-auth-js` with ExpressJS for different direct auth scenarios.

If you haven't done so already, register for a free account at [developer.okta.com](https://developer.okta.com/). Select **Create Free Account** and fill in the forms to complete the registration process. Once you are done and logged in, you will see your Okta Developer Console.

> **Tip**: You can also create an account using the [Okta CLI](https://github.com/oktadeveloper/okta-cli) and `okta register`. To create an app, run `okta apps create` and use the settings below.

Register your application by selecting **Applications** > **Add Application**. On the next screen, choose **Web App** and click **Next**.

On the following screen, edit the application settings. For ExpressJS applications running in developer mode, the port number should be 8080. Configure your app as follows:

* **Initiate Login URI**: `http://localhost:8080`
* **Login redirect URI**: `http://localhost:8080/login/callback`
* **Logout redirect URI**: `http://localhost:8080`

By default the app server runs at `http://localhost:8080`.

Once you have completed the form, edit the app settings by selecting `Interaction Code` in the **Application** section to enable the `OIE` features (please contact Okta Support if the feature is not avaiable in your org). With the application set up, you will be given **client ID** and **client secret**. You will also need the **issuer** value for your Okta org.

The **issuer** is the URL of the authorization server that will perform authentication.  All Developer Accounts have a "default" authorization server.  The issuer is a combination of your Org URL (found in the upper right of the console home page) and `/oauth2/default`. For example, `https://dev-133337.okta.com/oauth2/default`.

These values must exist as environment variables. They can be exported in the shell, or saved in a file named `testenv`, located in the root directory as this repo. See [dotenv](https://www.npmjs.com/package/dotenv) for more details on this file format.

```ini
ISSUER=https://{{yourOktaDomain}}/oauth2/default
CLIENT_ID=123xxxxx123
CLIENT_SECRET=456xxx
```

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd samples/generated/{{ name }} start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |
