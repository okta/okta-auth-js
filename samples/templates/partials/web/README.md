# {{ name }} sample

This sample demonstrates using `@okta/okta-auth-js` in NodeJS. The `signIn` method is used to authenticate users given a username and password. On success, the `signIn` method returns a transaction object containing a `sessionToken`. {{#if oidc}}This sample will use the `sessionToken` to establish an Okta session and execute the OIDC flow to obtain tokens. {{else}}The `sessionToken` can be used to establish an Okta session.{{/if}}

By default the app server runs at `http://localhost:{{ port }}`.

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd samples/{{ name }} start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |

## Configuring

If the current configuration is not valid, a form will be shown for setting configuration values. These values will be added to the URL as query parameters. To avoid seeing the form, you can pass parameters directly to the app through the URL. All query parameters should be URL-encoded.

Example:

```html
http://localhost:{{ port }}/?issuer=https%3A%2F%2Fabc.oktapreview.com%2Foauth2%2Fdefault
```

The following parameters are accepted by this app:

* `issuer` - (string) - set the issuer
* `username` - (string) - set the username
{{#if oidc}}
* `clientId` - (string) - set the client ID
* `clientSecret` - (string) - set the client secret. :warning: Exposing the clientSecret client-side is a serious security risk. This option is accepted in this sample app as a convenience for developers. Production apps should take care to store the `clientSecret` server-side and **never** leak it to the client-side.
{{/if}}
