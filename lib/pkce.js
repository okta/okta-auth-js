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
var sdkCrypto     = require('./crypto');
var oauthUtil     = require('./oauthUtil');
var AuthSdkError  = require('./errors/AuthSdkError');

// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.

var MIN_VERIFIER_LENGTH = 43;
function generateVerifier(prefix) {
  var str = prefix;
  if (str.length < MIN_VERIFIER_LENGTH) {
    str = str + util.genRandomString(MIN_VERIFIER_LENGTH - str.length);
  }
  console.log('verifier length: ', str.length);
  return encodeURIComponent(str);
}

function computeChallenge(str) {
  return sdkCrypto.computeHash(str)
    .then(function(hash) {
      console.log('hash:', hash);
      //return hash;
      return btoa(hash); // base64 encode
    });
}



function getWithRedirect(sdk, oauthOptions, options) {
  oauthOptions = oauthOptions || {};
  oauthOptions.responseType = oauthOptions.responseType || 'code';
  oauthOptions.responseMode = oauthOptions.responseMode || 'fragment';

  return sdk.token.getWithRedirect(oauthOptions, options);

}

function parseFromUrl(sdk, url) {
  return sdk.token.parseFromUrl(url)
    .then(function(res) {
      return res.authorizationCode;
    });
}

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

function validateOptions(oauthParams) {
  // Quick validation
  if (!oauthParams.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (util.isString(oauthParams.responseType) && oauthParams.responseType.indexOf(' ') !== -1) {
    throw new AuthSdkError('Multiple OAuth responseTypes must be defined as an array');
  }

}

// for /v1/token endpoint
function getQueryParams(options) {
  // Convert our params to their actual OAuth equivalents
  var params = util.removeNils({
    'client_id': options.clientId,
    'redirect_uri': options.redirectUri,
    'grant_type': options.grantType,
    //'response_type': options.responseType,
    'code': options.code,
    'code_verifier': options.codeVerifier
  });

  if (Array.isArray(params['response_type'])) {
    params['response_type'] = params['response_type'].join(' ');
  }

  // Object.keys(params).forEach(function(key) {
  //   params[key] = encodeURIComponent(params[key]);
  // });

  return params;
}

// exchange authoriza code for an access token
function exchangeForToken(sdk, oauthOptions, options) {
  oauthOptions = setDefaultOptions(sdk, oauthOptions || {});
  options = options || {};

  validateOptions(oauthOptions);
  // Default OAuth query params
  //oauthParams = setDefaultOptions(sdk, oauthOptions);

  // oauthParams.grant_type = 'authorization_code';

    // Use the query params to build the authorize url
  // var requestUrl,
  //   params,
  //   urls;

  // Get authorizeUrl and issuer
  var params = getQueryParams(oauthOptions);
  var urls = oauthUtil.getOAuthUrls(sdk, params, options);
  // params = util.toQueryParams(oauthParams);
  // requestUrl = urls.tokenUrl + params;

  return http.httpRequest(sdk, {
    url: urls.tokenUrl,
    method: 'POST',
    args: params,
    // headers: {
    //   'Access-Control-Request-Headers': '*'
    // },
    //crossOrigin: true,
    withCredentials: false
  });


}

module.exports = {
  computeChallenge: computeChallenge,
  exchangeForToken: exchangeForToken,
  getWithRedirect: getWithRedirect,
  parseFromUrl: parseFromUrl,
  generateVerifier: generateVerifier
};
