/* eslint-disable @typescript-eslint/no-non-null-assertion */
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


import { isString, removeNils, toQueryString } from '../../util';
import { AuthSdkError } from '../../errors';
import { OAuthParams, TokenParams } from '../types';

export function convertTokenParamsToOAuthParams(tokenParams: TokenParams) {
  // Quick validation
  if (!tokenParams.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (isString(tokenParams.responseType) && tokenParams.responseType.indexOf(' ') !== -1) {
    throw new AuthSdkError('Multiple OAuth responseTypes must be defined as an array');
  }

  // Convert our params to their actual OAuth equivalents
  var oauthParams: OAuthParams = {
    'client_id': tokenParams.clientId,
    'code_challenge': tokenParams.codeChallenge,
    'code_challenge_method': tokenParams.codeChallengeMethod,
    'display': tokenParams.display,
    'idp': tokenParams.idp,
    'idp_scope': tokenParams.idpScope,
    'login_hint': tokenParams.loginHint,
    'max_age': tokenParams.maxAge,
    'nonce': tokenParams.nonce,
    'prompt': tokenParams.prompt,
    'redirect_uri': tokenParams.redirectUri,
    'response_mode': tokenParams.responseMode,
    'response_type': tokenParams.responseType,
    'sessionToken': tokenParams.sessionToken,
    'state': tokenParams.state,
    'acr_values': tokenParams.acrValues,
    'enroll_amr_values': tokenParams.enrollAmrValues,
  };
  oauthParams = removeNils(oauthParams) as OAuthParams;

  ['idp_scope', 'response_type', 'enroll_amr_values'].forEach(function (mayBeArray) {
    if (Array.isArray(oauthParams[mayBeArray])) {
      oauthParams[mayBeArray] = oauthParams[mayBeArray].join(' ');
    }
  });

  if (tokenParams.responseType!.indexOf('id_token') !== -1 &&
    tokenParams.scopes!.indexOf('openid') === -1) {
    throw new AuthSdkError('openid scope must be specified in the scopes argument when requesting an id_token');
  } else if (tokenParams.scopes) {
    oauthParams.scope = tokenParams.scopes!.join(' ');
  }

  return oauthParams;
}

export function buildAuthorizeParams(tokenParams: TokenParams) {
  var oauthQueryParams = convertTokenParamsToOAuthParams(tokenParams);
  return toQueryString({ 
    ...oauthQueryParams, 
    ...(tokenParams.extraParams && { ...tokenParams.extraParams })
  });
}
