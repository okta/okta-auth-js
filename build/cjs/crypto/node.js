"use strict";

exports.webcrypto = exports.btoa = exports.atob = void 0;

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
let a;
exports.atob = a;

if (typeof atob !== 'undefined') {
  exports.atob = a = atob;
} else {
  exports.atob = a = require('atob');
}

let b;
exports.btoa = b;

if (typeof btoa !== 'undefined') {
  exports.btoa = b = btoa;
} else {
  exports.btoa = b = require('btoa');
}

let crypto;

try {
  crypto = require('crypto');
} catch (err) {// this environment has no crypto module!
}

let webcrypto;
exports.webcrypto = webcrypto;

if (typeof crypto !== 'undefined' && crypto['webcrypto']) {
  exports.webcrypto = webcrypto = crypto['webcrypto'];
} else {
  const {
    Crypto
  } = require('@peculiar/webcrypto');

  exports.webcrypto = webcrypto = new Crypto();
}
//# sourceMappingURL=node.js.map