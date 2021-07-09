# E2E (End-to-End) Tests for okta-auth-js samples

## Setting up the Test environment

It is assumed:

* You have already created a SPA application. [Guide: Create an Okta Application](https://developer.okta.com/docs/guides/sign-into-spa/angular/create-okta-application/).
* The SPA app has a login redirect URI configured: `http://localhost:8080/implicit/callback`
* You have credentials to a valid app user. (The user is assigned to the app and can signin)
* You have also created a Web application and have access to the client secret

Before running the E2E tests, you will need to gather the following information.

* **CLIENT_ID** - The client ID of a SPA application. This can be found in the Okta Admin UI on the "General" tab of an application, or the list of applications.
* **ISSUER** - This is the URL of the authorization server that will perform authentication.  All Developer Accounts have a "default" authorization server.  The issuer is a combination of your Org URL (found in the upper right of the console home page) and `/oauth2/default`. For example, `https://dev-1234.oktapreview.com/oauth2/default`.
* **USERNAME** - Username of a valid app user for the provided client ID.
* **PASSWORD** - Password for the app user
* **WEB_CLIENT_ID** - The client ID of a Web application.
* **WEB_CLIENT_SECRET** - The client secret for the Web application

These values must exist as environment variables. They can be exported in the shell, or saved in a file named `testenv`, located in the **root workspace** directory. The format is that of a basic "ini" file. See [dotenv](https://www.npmjs.com/package/dotenv) for more details on this file format.

```ini
ISSUER=https://yourOktaDomain.com/oauth2/default
CLIENT_ID=123xxxxx123
USERNAME=mytestuser
PASSWORD=testPassword1
WEB_CLIENT_ID=123xxxx
WEB_CLIENT_SECRET=sOmeSecretString
```

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd test/e2e start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Start app server and test runner, runs all specs |
| `yarn start:app`      | Start app server and open a new browser window   |
| `yarn start:runner`        | Start the test runner, runs all specs                             |
