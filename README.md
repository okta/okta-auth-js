[![Build Status](https://travis-ci.org/okta/okta-auth-js.svg?branch=master)](https://travis-ci.org/okta/okta-auth-js)

# Okta Auth JS

Okta Auth JS is a wrapper around [Okta's authentication API](http://developer.okta.com/docs/api/resources/authn.html). It can be used to get an Okta session cookie or an ID token.

If you want to use the SDK, see the instructions on [the Okta Auth SDK developer page](http://developer.okta.com/docs/guides/okta_auth_sdk.html).

If you wish to contribute to okta-auth-js, please read the following [contributing guidelines](./CONTRIBUTING.md)

If you want to modify the SDK, use the following instructions.

## Building the SDK

1. Clone the SDK repo.

    ```bash
    [path]$ git clone git@github.com:okta/okta-auth-js.git
    ```

2. Navigate to the new `okta-auth-js` folder, and install the Okta node dependencies.

    ```bash
    [path/okta-auth-js]$ npm install
    ```

3. Build the SDK. The output will be under `dist/browser/`. The standalone version is `OktaAuthReqwest.min.js`.

    ```bash
    [path/okta-auth-js]$ npm run build
    ```

## Build and test commands

| Command | Description |
| --- | --- |
| `npm run build` | Build the SDK |
| `npm test` | Run unit tests |
| `npm run lint:report` | Run linting tests |
