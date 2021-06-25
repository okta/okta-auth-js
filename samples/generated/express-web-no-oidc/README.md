[sessionToken]: https://developer.okta.com/docs/reference/api/sessions/#session-token
[signIn]: https://github.com/okta/okta-auth-js#signinoptions

# express-web-no-oidc sample

This sample demonstrates using `@okta/okta-auth-js` in NodeJS. The [signIn][signIn] method is used to authenticate users given a username and password. On success, the [signIn][signIn] method returns a transaction object containing a [sessionToken][sessionToken]. The [sessionToken][sessionToken] can be used to establish an Okta session.

By default the app server runs at `http://localhost:8080`.

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd samples/generated/express-web-no-oidc start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |

## Configuring

If the current configuration is not valid, a form will be shown for setting configuration values. These values will be added to the URL as query parameters. To avoid seeing the form, you can pass parameters directly to the app through the URL. All query parameters should be URL-encoded.

Example:

```html
http://localhost:8080/?issuer=https%3A%2F%2Fabc.oktapreview.com%2Foauth2%2Fdefault
```

The following parameters are accepted by this app:

* `issuer` - (string) - set the issuer
* `username` - (string) - set the username
