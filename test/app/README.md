# test-app

The following enironment variables are **required**. You can use a [.env file](https://github.com/motdotla/dotenv#usage) in this directory.

* `CLIENT_ID` - abc12
* `DOMAIN` - x.okta.com

The following parameters are accepted in the URL:

* `grantType` - set the default grantType (needed for PKCE token renew)
* `scopes` - set the scopes passed during OAuth flow. Comma delimited.
* `responseType` - set the responseType passed during OAuth flow. Comma delimited.

All params can be used together:
`http://localhost:8080/?scopes=openid,email&responseType=id_token,token&grantType=authorization_code`
