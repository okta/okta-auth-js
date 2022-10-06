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


/* global */
var factory = {};

// converts a standard base64-encoded string to a "url/filename safe" variant
var base64ToBase64Url = function(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// converts a string to base64 (url/filename safe variant)
var stringToBase64Url = function(str) {
  var b64 = btoa(str);
  return base64ToBase64Url(b64);
};

factory.buildIDToken = function(options) {
  var header = {};
  var signature = {};
  var payload = {};

  options = options || {};
  payload.iss = options.issuer;
  payload.aud = options.clientId;
  payload.iat = Date.now() / 1000;
  payload.exp = payload.iat + (1000 * 30);

  return [
    stringToBase64Url(JSON.stringify(header)),
    stringToBase64Url(JSON.stringify(payload)),
    stringToBase64Url(JSON.stringify(signature))
  ].join('.');
};

module.exports = factory;