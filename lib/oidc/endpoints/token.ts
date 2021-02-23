import { RefreshToken } from './../../../build/lib/types/Token.d';

import { AuthSdkError } from '../../errors';
import { CustomUrls, OAuthParams, OAuthResponse, TokenParams } from '../../types';
import { removeNils, toQueryString } from '../../util';
import http from '../../http';

function validateOptions(options: TokenParams) {
  // Quick validation
  if (!options.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (!options.redirectUri) {
    throw new AuthSdkError('The redirectUri passed to /authorize must also be passed to /token');
  }

  if (!options.authorizationCode && !options.interactionCode) {
    throw new AuthSdkError('An authorization code (returned from /authorize) must be passed to /token');
  }

  if (!options.codeVerifier) {
    throw new AuthSdkError('The "codeVerifier" (generated and saved by your app) must be passed to /token');
  }
}

function getPostData(options: TokenParams): string {
  // Convert Token params to OAuth params, sent to the /token endpoint
  var params: OAuthParams = removeNils({
    'client_id': options.clientId,
    'redirect_uri': options.redirectUri,
    'grant_type': options.interactionCode ? 'interaction_code' : 'authorization_code',
    'code_verifier': options.codeVerifier
  });

  if (options.interactionCode) {
    params['interaction_code'] = options.interactionCode;
  } else if (options.authorizationCode) {
    params.code = options.authorizationCode;
  }

  // Encode as URL string
  return toQueryString(params).slice(1);
}

// exchange authorization code for an access token
export function postToTokenEndpoint(sdk, options: TokenParams, urls: CustomUrls): Promise<OAuthResponse> {
  validateOptions(options);
  var data = getPostData(options);

  return http.httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: data,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

export function postRenewTokensWithRefreshToken(sdk, options: TokenParams, refreshTokenObject: RefreshToken): Promise<OAuthResponse> {
  return http.httpRequest(sdk, {
    url: refreshTokenObject.tokenUrl,
    method: 'POST',
    withCredentials: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },

    args: Object.entries({
      client_id: options.clientId, // eslint-disable-line camelcase
      grant_type: 'refresh_token', // eslint-disable-line camelcase
      scope: refreshTokenObject.scopes.join(' '),
      refresh_token: refreshTokenObject.refreshToken, // eslint-disable-line camelcase
    }).map(function ([name, value]) {
      return name + '=' + encodeURIComponent(value);
    }).join('&'),
  });
}