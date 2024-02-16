/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
  OktaAuthOAuthInterface,
  TokenVerifyParams,
  IDToken,
  OAuthResponse,
  TokenParams,
  TokenResponse,
  CustomUrls,
  Tokens,
} from './types';
import { verifyToken } from './verifyToken';
import { getDefaultTokenParams } from './util';

function validateResponse(res: OAuthResponse, oauthParams: TokenParams) {
  if (res['error'] && res['error_description']) {
    throw new OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
  }

  // https://datatracker.ietf.org/doc/html/rfc9449#token-response
  // "A token_type of DPoP MUST be included in the access token response to signal to the client"
  if (oauthParams.dpop && res.token_type !== 'DPoP') {
    throw new AuthSdkError('Unable to parse OAuth flow response: DPoP was configured but "token_type" was not DPoP');
  }
}

export async function handleOAuthResponse(
  sdk: OktaAuthOAuthInterface,
  tokenParams: TokenParams,
  res: OAuthResponse,
  urls?: CustomUrls
): Promise<TokenResponse> {
  const pkce = sdk.options.pkce !== false;

  // The result contains an authorization_code and PKCE is enabled 
  // `exchangeCodeForTokens` will call /token then call `handleOauthResponse` recursively with the result
  if (pkce && (res.code || res.interaction_code)) {
    return sdk.token.exchangeCodeForTokens(Object.assign({}, tokenParams, {
      authorizationCode: res.code,
      interactionCode: res.interaction_code
    }), urls);
  }

  tokenParams = tokenParams || getDefaultTokenParams(sdk);
  urls = urls || getOAuthUrls(sdk, tokenParams);

  let responseType = tokenParams.responseType || [];
  if (!Array.isArray(responseType) && responseType !== 'none') {
    responseType = [responseType];
  }

  let scopes;
  if (res.scope) {
    scopes = res.scope.split(' ');
  } else {
    scopes = clone(tokenParams.scopes);
  }
  const clientId = tokenParams.clientId || sdk.options.clientId;

  // Handling the result from implicit flow or PKCE token exchange
  validateResponse(res, tokenParams);

  const tokenDict = {} as Tokens;
  const expiresIn = res.expires_in;
  const tokenType = res.token_type;
  const accessToken = res.access_token;
  const idToken = res.id_token;
  const refreshToken = res.refresh_token;
  const now = Math.floor(Date.now()/1000);

  if (accessToken) {
    const accessJwt = sdk.token.decode(accessToken);
    tokenDict.accessToken = {
      accessToken: accessToken,
      claims: accessJwt.payload,
      expiresAt: Number(expiresIn) + now,
      tokenType: tokenType!,
      scopes: scopes,
      authorizeUrl: urls.authorizeUrl!,
      userinfoUrl: urls.userinfoUrl!
    };

    if (tokenParams.dpopPairId) {
      tokenDict.accessToken.dpopPairId = tokenParams.dpopPairId;
    }
  }

  if (refreshToken) {
    tokenDict.refreshToken = {
      refreshToken: refreshToken,
      // should not be used, this is the accessToken expire time
      // TODO: remove "expiresAt" in the next major version OKTA-407224
      expiresAt: Number(expiresIn) + now, 
      scopes: scopes,
      tokenUrl: urls.tokenUrl!,
      authorizeUrl: urls.authorizeUrl!,
      issuer: urls.issuer!,
    };

    if (tokenParams.dpopPairId) {
      tokenDict.refreshToken.dpopPairId = tokenParams.dpopPairId;
    }
  }

  if (idToken) {
    const idJwt = sdk.token.decode(idToken);
    const idTokenObj: IDToken = {
      idToken: idToken,
      claims: idJwt.payload,
      expiresAt: idJwt.payload.exp! - idJwt.payload.iat! + now, // adjusting expiresAt to be in local time
      scopes: scopes,
      authorizeUrl: urls.authorizeUrl!,
      issuer: urls.issuer!,
      clientId: clientId!
    };

    const validationParams: TokenVerifyParams = {
      clientId: clientId!,
      issuer: urls.issuer!,
      nonce: tokenParams.nonce,
      accessToken: accessToken,
      acrValues: tokenParams.acrValues
    };

    if (tokenParams.ignoreSignature !== undefined) {
      validationParams.ignoreSignature = tokenParams.ignoreSignature;
    }

    await verifyToken(sdk, idTokenObj, validationParams);
    tokenDict.idToken = idTokenObj;
  }

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
    state: res.state!,
    code: res.code,
    responseType
  };
  
}