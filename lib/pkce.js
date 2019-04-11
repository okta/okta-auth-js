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

 /* eslint-disable complexity, max-statements */
var http          = require('./http');
var util          = require('./util');
var oauthUtil     = require('./oauthUtil');
var AuthSdkError  = require('./errors/AuthSdkError');
var token      = require('./token');

// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.
var MIN_VERIFIER_LENGTH = 43;
function generateVerifier(prefix) {
  prefix = prefix || '';
  var str = prefix;
  if (str.length < MIN_VERIFIER_LENGTH) {
    str = str + util.genRandomString(MIN_VERIFIER_LENGTH - str.length);
  }
  return encodeURIComponent(str);
}

/* global Uint8Array */
function computeChallenge(str) {  
  var buffer = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', buffer).then(function(arrayBuffer) {
    var hash = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    var b64 = btoa(hash); // standard base64 encode
    var b64u = util.base64ToBase64Url(b64); // use url-safe base64 variant
    return b64u;
  });
}

// for /v1/token endpoint
function setDefaultOptions(sdk, options) {
  options = util.clone(options) || {};
  var defaults = {
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    grantType: 'authorization_code'
  };
  util.extend(defaults, options);
  return defaults;
}

function validateOptions(oauthOptions) {
  // Quick validation
  if (!oauthOptions.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }
}

function getQueryParams(options) {
  // Convert options to OAuth params
  var params = util.removeNils({
    'client_id': options.clientId,
    'redirect_uri': options.redirectUri,
    'grant_type': options.grantType,
    'code': options.code,
    'code_verifier': options.codeVerifier
  });

  return params;
}

// exchange authorization code for an access token
function exchangeForToken(sdk, oauthOptions, options) {
  oauthOptions = setDefaultOptions(sdk, oauthOptions || {});
  options = options || {};

  validateOptions(oauthOptions);

  var params = getQueryParams(oauthOptions);
  var urls = oauthUtil.getOAuthUrls(sdk, params, options);

  return http.httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: params,
    withCredentials: false,
    headers: {
      'Content-Type': null // TODO: why is this necessary to avoid error?
    }
  })
  .then(function(res) {
    if (!oauthOptions.responseType) {
      oauthOptions.responseType = ['id_token', 'token'];
    }
    // scopes were passed in original /authorize call and are returned to us in this response 
    oauthOptions.scopes = res.scope.split(' ');
    return token.handleOAuthResponse(sdk, oauthOptions, res, urls);
  });
}

module.exports = {
  generateVerifier: generateVerifier,
  computeChallenge: computeChallenge,
  exchangeForToken: exchangeForToken
};
