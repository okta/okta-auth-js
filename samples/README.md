# Samples for @okta/okta-auth-js

## Overview

Working samples are [generated](generated) from a set of [templates](templates). There are [tests](test/specs) to verify that these samples work as expected. 

## Running a sample

Any individual sample can be run using yarn:

```bash
cd samples/generated/sample-name
yarn start
```

or

```bash
yarn --cwd samples/generated/sample-name start
```

The sample apps have no embedded configuration. All configuration is loaded from URL query parameters and encoded into the `state` param to survive round-trip redirects. If the app is loaded without valid configuration, a form will be shown for the user (you, the developer) to provide the needed values.

## Using a sample to build your own app

Any of the [generated](generated) samples can be copied from this repo and used as the basis for a new app. In most cases, the sample apps are following best practices. If you decide to use any of this code in your own app there are a few things you should keep in mind:

- These sample apps have no embedded configuration. In the sample apps, all configuration is loaded from URL query parameters and encoded into the `state` param to survive round-trip redirects. If the configuration is not valid, a form is shown for the user to provide values. In most real-world applications, the app user cannot be expected to provide these values. Your app should probably embed configuration such as `clientId` and `issuer` as constants or load config from an internal source.

- Your app should take care to protect sensitive information. For example, the samples for "web" applications expose the `clientSecret` on the client-side. This makes the app very flexible for testing but also introduces a serious security leak. In a production application, the `clientSecret` should **always** be stored in server-side configuration and **never** leaked to the client.

## Running tests

To run tests for all samples, run `yarn test`

Tests for an individual sample can be run using the `SAMPLE_NAME` environment variable:

```bash
SAMPLE_NAME=webpack-spa test
```

## Generating samples

To generate all samples run `yarn build`. To generate a specific sample, add the sample name. For example, `yarn build webpack-spa` would generate the sample named "webpack-spa"
