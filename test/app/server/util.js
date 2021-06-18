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


const btoa = require('btoa');
const crypto = require('crypto');

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  const b64 = btoa(str);
  return base64ToBase64Url(b64);
}

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}


module.exports = {
  uniqueId,
  base64ToBase64Url,
  stringToBase64Url
};
