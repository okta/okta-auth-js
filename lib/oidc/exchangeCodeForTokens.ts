/* eslint-disable max-len */
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
 *
 */
import { getOAuthUrls } from '../oidc';
import { CustomUrls, OAuthResponse, OktaAuth, TokenParams, TokenResponse } from '../types';
import { getDefaultTokenParams } from './util';
import { clone } from '../util';
import { postToTokenEndpoint } from './endpoints/token';
import { handleOAuthResponse } from './handleOAuthResponse';

// codeVerifier is required. May pass either an authorizationCode or interactionCode
export function exchangeCodeForTokens(sdk: OktaAuth, tokenParams: TokenParams, urls?: CustomUrls): Promise<TokenResponse> {
  urls = urls || getOAuthUrls(sdk, tokenParams);
  // build params using defaults + options
  tokenParams = Object.assign({}, getDefaultTokenParams(sdk), clone(tokenParams));

  const {
    authorizationCode,
    interactionCode,
    codeVerifier,
    clientId,
    redirectUri,
    scopes,
    ignoreSignature,
    state
  } = tokenParams;

  var getTokenOptions = {
    clientId,
    redirectUri,
    authorizationCode,
    interactionCode,
    codeVerifier,
  };

  return postToTokenEndpoint(sdk, getTokenOptions, urls)
    .then((response: OAuthResponse) => {

      // `handleOAuthResponse` hanadles responses from both `/authorize` and `/token` endpoints
      // Here we modify the response from `/token` so that it more closely matches a response from `/authorize`
      // `responseType` is used to validate that the expected tokens were returned
      const responseType = ['token']; // an accessToken will always be returned
      if (scopes.indexOf('openid') !== -1) {
        responseType.push('id_token'); // an idToken will be returned if "openid" is in the scopes
      }
      const handleResponseOptions: TokenParams = {
        clientId,
        redirectUri,
        scopes,
        responseType,
        ignoreSignature,
      };
      return handleOAuthResponse(sdk, handleResponseOptions, response, urls)
        .then((response: TokenResponse) => {
          // For compatibility, "code" is returned in the TokenResponse. OKTA-326091
          response.code = authorizationCode;
          response.state = state;
          return response;
        });
    })
    .finally(() => {
      sdk.transactionManager.clear();
    });
}