
/* eslint-disable complexity, max-statements */
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
import { clone } from '../util';
import {
  getOAuthUrls,
} from './util/oauth';
import { AuthSdkError, OAuthError } from '../errors';
import {
  OktaAuth,
  TokenVerifyParams,
  IDToken,
  OAuthResponse,
  TokenParams,
  TokenResponse,
  CustomUrls,
  Tokens,
} from '../types';
import { exchangeCodeForTokens } from './exchangeCodeForTokens';
import { verifyToken } from './verifyToken';
import { getDefaultTokenParams } from '.';

function validateResponse(res: OAuthResponse, oauthParams: TokenParams) {
  if (res['error'] || res['error_description']) {
    throw new OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
  }
}

// eslint-disable-next-line max-len
export function handleOAuthResponse(sdk: OktaAuth, tokenParams: TokenParams, res: OAuthResponse, urls: CustomUrls): Promise<TokenResponse> {
  var pkce = sdk.options.pkce !== false;

  // The result contains an authorization_code and PKCE is enabled 
  // `exchangeCodeForTokens` will call /token then call `handleOauthResponse` recursively with the result
  if (pkce && (res.code || res.interaction_code)) {
    return exchangeCodeForTokens(sdk, Object.assign({}, tokenParams, {
      authorizationCode: res.code,
      interactionCode: res.interaction_code
    }), urls);
  }

  tokenParams = tokenParams || getDefaultTokenParams(sdk);
  urls = urls || getOAuthUrls(sdk, tokenParams);

  var responseType = tokenParams.responseType;
  if (!Array.isArray(responseType)) {
    responseType = [responseType];
  }

  var scopes = clone(tokenParams.scopes);
  var clientId = tokenParams.clientId || sdk.options.clientId;

  // Handling the result from implicit flow or PKCE token exchange
  return Promise.resolve()
    .then(function () {
      validateResponse(res, tokenParams);
    }).then(function () {
      var tokenDict = {} as Tokens;
      var expiresIn = res.expires_in;
      var tokenType = res.token_type;
      var accessToken = res.access_token;
      var idToken = res.id_token;
      var refreshToken = res.refresh_token;

      if (accessToken) {
        var accessJwt = sdk.token.decode(accessToken);
        tokenDict.accessToken = {
          value: accessToken, 
          accessToken: accessToken,
          claims: accessJwt.payload,
          expiresAt: Number(expiresIn) + Math.floor(Date.now() / 1000),
          tokenType: tokenType,
          scopes: scopes,
          authorizeUrl: urls.authorizeUrl,
          userinfoUrl: urls.userinfoUrl
        };
      }

      if (refreshToken) {
        tokenDict.refreshToken = {
          value: refreshToken, 
          refreshToken: refreshToken,
          expiresAt: Number(expiresIn) + Math.floor(Date.now() / 1000),
          scopes: scopes,
          tokenUrl: urls.tokenUrl,
          authorizeUrl: urls.authorizeUrl,
          issuer: urls.issuer,
        };
      }

      if (idToken) {
        var idJwt = sdk.token.decode(idToken);

        var idTokenObj: IDToken = {
          value: idToken,
          idToken: idToken,
          claims: idJwt.payload,
          expiresAt: idJwt.payload.exp,
          scopes: scopes,
          authorizeUrl: urls.authorizeUrl,
          issuer: urls.issuer,
          clientId: clientId
        };

        var validationParams: TokenVerifyParams = {
          clientId: clientId,
          issuer: urls.issuer,
          nonce: tokenParams.nonce,
          accessToken: accessToken
        };

        if (tokenParams.ignoreSignature !== undefined) {
          validationParams.ignoreSignature = tokenParams.ignoreSignature;
        }

        return verifyToken(sdk, idTokenObj, validationParams)
          .then(function () {
            tokenDict.idToken = idTokenObj;
            return tokenDict;
          });
      }

      return tokenDict;
    })
    .then(function (tokenDict): TokenResponse {
      // Validate received tokens against requested response types 
      if (responseType.indexOf('token') !== -1 && !tokenDict.accessToken) {
        // eslint-disable-next-line max-len
        throw new AuthSdkError('Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.');
      }
      if (responseType.indexOf('id_token') !== -1 && !tokenDict.idToken) {
        // eslint-disable-next-line max-len
        throw new AuthSdkError('Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.');
      }

      return {
        tokens: tokenDict,
        state: res.state,
        code: res.code
      };
    });
}