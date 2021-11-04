# E2E (End-to-End) Tests

## Setting up the Test environment

It is assumed:

* You have already created a SPA application. [Guide: Create an Okta Application](https://developer.okta.com/docs/guides/sign-into-spa/angular/create-okta-application/).
* The SPA app has a login redirect URI configured: `http://localhost:8080/implicit/callback`
* You have credentials to a valid app user. (The user is assigned to the app and can signin)

Before running the E2E tests, you will need to gather the following information.

* **CLIENT_ID** - The client ID of a SPA application. This can be found in the Okta Admin UI on the "General" tab of an application, or the list of applications.
* **ISSUER** - This is the URL of the authorization server that will perform authentication.  All Developer Accounts have a "default" authorization server.  The issuer is a combination of your Org URL (found in the upper right of the console home page) and `/oauth2/default`. For example, `https://dev-1234.oktapreview.com/oauth2/default`.
* **USERNAME** - Username of a valid app user for the provided client ID.
* **PASSWORD** - Password for the app user

These values must exist as environment variables. They can be exported in the shell, or saved in a file named `testenv`, located in the **root workspace** directory. The format is that of a basic "ini" file. See [dotenv](https://www.npmjs.com/package/dotenv) for more details on this file format.

```ini
ISSUER=https://yourOktaDomain.com/oauth2/default
CLIENT_ID=123xxxxx123
USERNAME=mytestuser
PASSWORD=testPassword1
```

You may need to set the `CHROMEDRIVER_VERSION` environment variable to match the version of Chrome on your machine. For example, `CHROMEDRIVER_VERSION=94.0.4606.41` can be added to the `testenv` file to work with Chrome version 94. Latest version numbers can be found at [chromedriver.chromium.org](https://chromedriver.chromium.org/downloads)

## Commands

If running from the workspace directory: `yarn workspace @okta/test.e2e start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Start app server and test runner, runs all specs |
| `yarn start:app`      | Start app server and open a new browser window   |
| `yarn start:runner`        | Start the test runner, runs all specs                             |
