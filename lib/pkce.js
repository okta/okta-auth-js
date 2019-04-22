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
  var verifier = prefix || '';
  if (verifier.length < MIN_VERIFIER_LENGTH) {
    verifier = verifier + util.genRandomString(MIN_VERIFIER_LENGTH - verifier.length);
  }
  return encodeURIComponent(verifier);
}

function saveVerifier(sdk, codeVerifier) {
  var storage = sdk.options.storageUtil.getPKCEStorage();
  storage.setStorage({
    'code_verifier': codeVerifier
  });
}

function loadVerifier(sdk) {
  var storage = sdk.options.storageUtil.getPKCEStorage();
  var obj = storage.getStorage();
  return obj['code_verifier'];
}

/* global Uint8Array, TextEncoder */
function computeChallenge(str) {  
  var buffer = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', buffer).then(function(arrayBuffer) {
    var hash = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    var b64u = util.stringToBase64Url(hash); // url-safe base64 variant
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

function getPostData(options) {
  // Convert options to OAuth params
  var params = util.removeNils({
    'client_id': options.clientId,
    'redirect_uri': options.redirectUri,
    'grant_type': options.grantType,
    'code': options.code,
    'code_verifier': options.codeVerifier
  });
  // Encode as URL string
  return util.toQueryParams(params).slice(1);
}

// exchange authorization code for an access token
function exchangeForToken(sdk, oauthOptions, options) {
  oauthOptions = setDefaultOptions(sdk, oauthOptions || {});
  options = options || {};

  if (!oauthOptions.codeVerifier) {
    oauthOptions.codeVerifier = loadVerifier(sdk);
  }

  validateOptions(oauthOptions);

  var data = getPostData(oauthOptions);
  var urls = oauthUtil.getOAuthUrls(sdk, oauthOptions, options);

  return http.httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: data,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
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
  saveVerifier: saveVerifier,
  loadVerifier: loadVerifier,
  computeChallenge: computeChallenge,
  exchangeForToken: exchangeForToken
};
