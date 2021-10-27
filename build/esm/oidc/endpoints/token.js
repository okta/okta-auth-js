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
import { AuthSdkError } from '../../errors';
import { removeNils, toQueryString } from '../../util';
import { httpRequest } from '../../http';

function validateOptions(options) {
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

function getPostData(sdk, options) {
  // Convert Token params to OAuth params, sent to the /token endpoint
  var params = removeNils({
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

  var {
    clientSecret
  } = sdk.options;

  if (clientSecret) {
    params['client_secret'] = clientSecret;
  } // Encode as URL string


  return toQueryString(params).slice(1);
} // exchange authorization code for an access token


export function postToTokenEndpoint(sdk, options, urls) {
  validateOptions(options);
  var data = getPostData(sdk, options);
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  return httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: data,
    headers
  });
}
export function postRefreshToken(sdk, options, refreshToken) {
  return httpRequest(sdk, {
    url: refreshToken.tokenUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    args: Object.entries({
      client_id: options.clientId,
      // eslint-disable-line camelcase
      grant_type: 'refresh_token',
      // eslint-disable-line camelcase
      scope: refreshToken.scopes.join(' '),
      refresh_token: refreshToken.refreshToken // eslint-disable-line camelcase

    }).map(function (_ref) {
      var [name, value] = _ref;
      return name + '=' + encodeURIComponent(value);
    }).join('&')
  });
}
//# sourceMappingURL=token.js.map