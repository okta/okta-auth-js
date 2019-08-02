/*!
 * Copyright (c) 2019-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
var AuthSdkError  = require('./errors/AuthSdkError');
var http          = require('./http');
var util          = require('./util');

// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.
var MIN_VERIFIER_LENGTH = 43;
var MAX_VERIFIER_LENGTH = 128;
var DEFAULT_CODE_CHALLENGE_METHOD = 'S256';

function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2);
}

function getRandomString(length) {
  var a = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(a);
  var str = Array.from(a, dec2hex).join('');
  return str.slice(0, length);
}

function generateVerifier(prefix) {
  var verifier = prefix || '';
  if (verifier.length < MIN_VERIFIER_LENGTH) {
    verifier = verifier + getRandomString(MIN_VERIFIER_LENGTH - verifier.length);
  }
  return encodeURIComponent(verifier).slice(0, MAX_VERIFIER_LENGTH);
}

function saveMeta(sdk, meta) {
  var storage = sdk.options.storageUtil.getPKCEStorage();
  storage.setStorage(meta);
}

function loadMeta(sdk) {
  var storage = sdk.options.storageUtil.getPKCEStorage();
  var obj = storage.getStorage();
  return obj;
}

function clearMeta(sdk) {
  var storage = sdk.options.storageUtil.getPKCEStorage();
  storage.clearStorage();
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


function validateOptions(oauthOptions) {
  // Quick validation
  if (!oauthOptions.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (!oauthOptions.redirectUri) {
    throw new AuthSdkError('The redirectUri passed to /authorize must also be passed to /token');
  }

  if (!oauthOptions.authorizationCode) {
    throw new AuthSdkError('An authorization code (returned from /authorize) must be passed to /token');
  }

  if (!oauthOptions.codeVerifier) {
    throw new AuthSdkError('The "codeVerifier" (generated and saved by your app) must be passed to /token');
  }
}

function getPostData(options) {
  // Convert options to OAuth params
  var params = util.removeNils({
    'client_id': options.clientId,
    'redirect_uri': options.redirectUri,
    'grant_type': 'authorization_code',
    'code': options.authorizationCode,
    'code_verifier': options.codeVerifier
  });
  // Encode as URL string
  return util.toQueryParams(params).slice(1);
}

// exchange authorization code for an access token
function getToken(sdk, oauthOptions, urls) {
  validateOptions(oauthOptions);
  var data = getPostData(oauthOptions);

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

module.exports = {
  DEFAULT_CODE_CHALLENGE_METHOD: DEFAULT_CODE_CHALLENGE_METHOD,
  generateVerifier: generateVerifier,
  clearMeta: clearMeta,
  saveMeta: saveMeta,
  loadMeta: loadMeta,
  computeChallenge: computeChallenge,
  getToken: getToken
};
