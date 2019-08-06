# test-app

The following enironment variables are **required**. You can use a [.env file](https://github.com/motdotla/dotenv#usage) in this directory.

* `CLIENT_ID` - abc12
* `ISSUER` - x.okta.com/oauth2/default

The following parameters are accepted in the URL:

* `pkce` - set PKCE flow
* `scopes` - set the scopes passed during OAuth flow. Comma delimited.
* `responseType` - set the responseType passed during OAuth flow. Comma delimited.

Params can be used together:
`http://localhost:8080/?scopes=openid,email&responseType=id_token,token`
