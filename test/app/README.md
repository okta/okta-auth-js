# test-app

By default the app server runs at `http://localhost:8080`. The callback redirect URI is `http://localhost:8080/implicit/callback`

## Commands

If running from the workspace directory, add the `--cwd` option: `yarn --cwd test/e2e start`

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn start`          | Starts the app server in headless mode |
| `yarn start:dev`           | Start the app server and open a new browser window     |

## Configuring via URL parameters

The following config parameters are accepted in the URL as encoded query parameters:

* `clientId` - set the client ID
* `issuer` - set the issuer
* `pkce` - true|false enable PKCE flow
* `scopes` - set the scopes passed during OAuth flow. Comma delimited.
* `responseType` - set the responseType passed during OAuth flow. Comma delimited.

Example:

```html
http://localhost:8080/?issuer=https%3A%2F%2Fabc.oktapreview.com%2Foauth2%2Fdefault&clientId=01234567xcdfgC80h7&pkce=false=openid,email&responseType=id_token,token
```

## Configuring via environment variables

Using environment variables is **optional**. They provide default values in the form only if **no** query parameters are provided in the URL. If **any** query parameters are passed, then **all** parameters will be read from the URL and environment variables will be ignored.

Environment variables are read from a file named `testenv`, if it exists, in the workspace directory. The format is that of a basic "ini" file. See [dotenv](https://www.npmjs.com/package/dotenv) for more details on this file format.

* `CLIENT_ID` - abc12
* `ISSUER` - x.okta.com/oauth2/default
