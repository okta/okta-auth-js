module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "issuer": "https://auth-js-test.okta.com",
    "authorization_endpoint": "https://auth-js-test.okta.com/oauth2/v1/authorize",
    "userinfo_endpoint": "https://auth-js-test.okta.com/oauth2/v1/userinfo",
    "jwks_uri": "https://auth-js-test.okta.com/oauth2/v1/keys",
    "response_types_supported": [
      "id_token",
      "id_token token"
    ],
    "response_modes_supported": [
      "query",
      "fragment"
    ],
    "grant_types_supported": [
      "implicit"
    ],
    "subject_types_supported": [
      "public"
    ],
    "id_token_signing_alg_values_supported": [
      "RS256"
    ],
    "scopes_supported": [
      "openid",
      "email",
      "profile",
      "address",
      "phone"
    ],
    "claims_supported": [
      "iss",
      "sub",
      "aud",
      "login",
      "iat",
      "exp",
      "auth_time",
      "amr",
      "idp",
      "idp_type",
      "nonce",
      "name",
      "nickname",
      "given_name",
      "middle_name",
      "family_name",
      "email",
      "email_verified",
      "profile",
      "zoneinfo",
      "locale",
      "address",
      "phone_number",
      "updated_at"
    ]
  }
};
