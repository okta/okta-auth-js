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
    "issuer": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7",
    "authorization_endpoint": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize",
    "token_endpoint": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token",
    "jwks_uri": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/keys",
    "response_types_supported": [
      "code",
      "token",
      "code token"
    ],
    "response_modes_supported": [
      "query",
      "fragment",
      "form_post",
      "okta_post_message"
    ],
    "grant_types_supported": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "password"
    ],
    "subject_types_supported": [
      "public"
    ],
    "scopes_supported": [
      "offline_access"
    ],
    "token_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ],
    "code_challenge_methods_supported": [
      "S256"
    ],
    "introspection_endpoint": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/introspect",
    "introspection_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ],
    "revocation_endpoint": "https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke",
    "revocation_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post",
      "none"
    ]
  }
};
