"use strict";

exports.postToTokenEndpoint = postToTokenEndpoint;
exports.postRefreshToken = postRefreshToken;

var _errors = require("../../errors");

var _util = require("../../util");

var _http = require("../../http");

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
function validateOptions(options) {
  // Quick validation
  if (!options.clientId) {
    throw new _errors.AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (!options.redirectUri) {
    throw new _errors.AuthSdkError('The redirectUri passed to /authorize must also be passed to /token');
  }

  if (!options.authorizationCode && !options.interactionCode) {
    throw new _errors.AuthSdkError('An authorization code (returned from /authorize) must be passed to /token');
  }

  if (!options.codeVerifier) {
    throw new _errors.AuthSdkError('The "codeVerifier" (generated and saved by your app) must be passed to /token');
  }
}

function getPostData(sdk, options) {
  // Convert Token params to OAuth params, sent to the /token endpoint
  var params = (0, _util.removeNils)({
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

  const {
    clientSecret
  } = sdk.options;

  if (clientSecret) {
    params['client_secret'] = clientSecret;
  } // Encode as URL string


  return (0, _util.toQueryString)(params).slice(1);
} // exchange authorization code for an access token


function postToTokenEndpoint(sdk, options, urls) {
  validateOptions(options);
  var data = getPostData(sdk, options);
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  return (0, _http.httpRequest)(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: data,
    headers
  });
}

function postRefreshToken(sdk, options, refreshToken) {
  return (0, _http.httpRequest)(sdk, {
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

    }).map(function ([name, value]) {
      return name + '=' + encodeURIComponent(value);
    }).join('&')
  });
}
//# sourceMappingURL=token.js.map