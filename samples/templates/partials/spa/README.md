# {{ name }} sample

This sample demonstrates using `@okta/okta-auth-js` within a SPA (single-page application). By default the app server runs at `http://localhost:{{ port }}`. The callback redirect URI is `http://localhost:{{ port }}{{ redirectPath }}`

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd samples/{{ name }} start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server |

## Configuring

If the current configuration is not valid, a form will be shown for setting configuration values. These values will be added to the URL as query parameters. To avoid seeing the form, you can pass parameters directly to the app through the URL. All query parameters should be URL-encoded.

Example:

```html
http://localhost:{{ port }}/?issuer=https%3A%2F%2Fabc.oktapreview.com%2Foauth2%2Fdefault&clientId=01234567xcdfgC80h7
```

The following parameters are accepted by this app:

* `clientId` - (string) - set the client ID
* `issuer` - (string) - set the issuer
* `storage` - ("memory"|"sessionStorage"|"localStorage"|"cookie") - set the `storage` option for the `TokenManager` token storage
{{#if requireUserSession}}
* `requireUserSession` - (true|false) - by default, a user will be considered authenticated if there are tokens in storage. This check does not require a network request. If the `requireUserSession` option is set to `true`, an additional check will be done to verify that the user has a valid Okta SSO
{{/if}}
* `flow` - ("redirect"{{#if signinForm}}|"form"{{/if}}{{#if signinWidget}}|"widget"{{/if}}) - set the authorization flow

## Authorization flows

Okta supports several methods of authentication. An authorization "flow" begins with one of these methods and ends when the app receives OIDC tokens. This sample demonstrates how to authenticate using the following flows:

### Redirect

Redirecting to Okta for authentication means your app does not need to provide any UI for signin. The signin page hosted by Okta will handle all details such as collecting credentials and multi-factor challenges and redirects back to your app on success.

{{#if signinWidget}}
### Self-hosted signin widget

The [Okta signin widget](https://github.com/okta/okta-signin-widget) can be embedded within your app. This provides the same signin experience as the Okta-hosted signin page within your app's UI and avoids a redirect round-trip.

{{/if}}
{{#if signinForm}}
### Custom signin form

This is a standard form which collects username and password. The UI is completely controlled by the app, including error handling. This flow will not work if MFA (multi-factor authentication) is enabled for this app.
{{/if}}