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

/* global atob, btoa */
// Ponyfill for NodeJS
// Webpack config excludes this file
var a;

if (typeof atob !== 'undefined') {
  a = atob;
} else {
  a = require('atob');
}

export { a as atob };
var b;

if (typeof btoa !== 'undefined') {
  b = btoa;
} else {
  b = require('btoa');
}

export { b as btoa };
var crypto;

try {
  crypto = require('crypto');
} catch (err) {// this environment has no crypto module!
}

var webcrypto;

if (typeof crypto !== 'undefined' && crypto['webcrypto']) {
  webcrypto = crypto['webcrypto'];
} else {
  var {
    Crypto
  } = require('@peculiar/webcrypto');

  webcrypto = new Crypto();
}

export { webcrypto };
//# sourceMappingURL=node.js.map