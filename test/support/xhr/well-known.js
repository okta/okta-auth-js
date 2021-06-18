/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "issuer": "https://auth-js-test.okta.com",
    "authorization_endpoint": "https://auth-js-test.okta.com/oauth2/v1/authorize",
    "userinfo_endpoint": "https://auth-js-test.okta.com/oauth2/v1/userinfo",
    "jwks_uri": "https://auth-js-test.okta.com/oauth2/v1/keys",
    "code_challenge_methods_supported": ["S256"],
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
