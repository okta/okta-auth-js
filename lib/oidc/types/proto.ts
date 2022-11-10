/* eslint-disable camelcase */
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

// https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication
export type ClientAuthenticationAssertionParams = {
  client_id?: string;
  client_assertion: string;
  client_assertion_type: string;
}

export type ClientAuthenticationSecretParams = {
  client_id: string;
  client_secret: string;
}

export type ClientAuthenticationNoneParams = {
  client_id: string;
}

export type ClientAuthenticationParams = 
  ClientAuthenticationAssertionParams | 
  ClientAuthenticationSecretParams |
  ClientAuthenticationNoneParams

export type CibaAuthorizeParams = ClientAuthenticationParams & {
  scope: string;
  acr_values?: string;
  login_hint?: string;
  id_token_hint?: string;
  binding_message?: string;
  request_expiry?: number;
}

export type CibaTokenParams = {
  grant_type: string;
  auth_req_id: string;
}

export type AuthorizeParams = {
  code_challenge?: string;
  code_challenge_method?: string;
  display?: string;
  idp?: string;
  idp_scope?: string | string[];
  login_hint?: string;
  max_age?: string | number;
  nonce?: string;
  prompt?: string;
  redirect_uri?: string;
  response_mode?: string;
  response_type?: string | string[];
  scope?: string;
  sessionToken?: string;
  state?: string;
  grant_type?: string;
  code?: string;
  interaction_code?: string;
  code_verifier?: string;
}

export type OAuthParams = ClientAuthenticationParams & AuthorizeParams

export type TokenParamsProto = ClientAuthenticationParams & 
  (CibaTokenParams | AuthorizeParams)

export interface OAuthResponse {
  state?: string;
  code?: string;
  interaction_code?: string;
  expires_in?: string;
  token_type?: string;
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface WellKnownResponse {
  issuer: string;
  authorization_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  claims_supported: string[];
}


export type OAuthResponseMode = 'okta_post_message' |'fragment' |'query' |'form_post';

export type OAuthResponseType = 'code' |'token' |'id_token' | 'refresh_token';
