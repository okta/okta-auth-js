"use strict";

exports.stringToBase64Url = stringToBase64Url;
exports.base64ToBase64Url = base64ToBase64Url;
exports.base64UrlToBase64 = base64UrlToBase64;
exports.base64UrlToString = base64UrlToString;
exports.stringToBuffer = stringToBuffer;
exports.base64UrlDecode = base64UrlDecode;

var _errors = require("../errors");

var _webcrypto = require("./webcrypto");

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
// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  var b64 = (0, _webcrypto.btoa)(str);
  return base64ToBase64Url(b64);
} // converts a standard base64-encoded string to a "url/filename safe" variant


function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
} // converts a "url/filename safe" base64 string to a "standard" base64 string


function base64UrlToBase64(b64u) {
  return b64u.replace(/-/g, '+').replace(/_/g, '/');
}

function base64UrlToString(b64u) {
  var b64 = base64UrlToBase64(b64u);

  switch (b64.length % 4) {
    case 0:
      break;

    case 2:
      b64 += '==';
      break;

    case 3:
      b64 += '=';
      break;

    default:
      throw new _errors.AuthSdkError('Not a valid Base64Url');
  }

  var utf8 = (0, _webcrypto.atob)(b64);

  try {
    return decodeURIComponent(escape(utf8));
  } catch (e) {
    return utf8;
  }
}

function stringToBuffer(str) {
  var buffer = new Uint8Array(str.length);

  for (var i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }

  return buffer;
}

function base64UrlDecode(str) {
  return (0, _webcrypto.atob)(base64UrlToBase64(str));
}
//# sourceMappingURL=base64.js.map