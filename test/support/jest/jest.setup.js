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

const crypto = require('node:crypto');
const { TextEncoder, TextDecoder } = require('node:util');


if (process.env.DETECT_LEAKS) {
  // detect open timeouts, network connections
  require('leaked-handles').set({
    fullStack: true, // use full stack traces
    debugSockets: true // pretty print tcp thrown exceptions.
  });
}

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: crypto.subtle
  }
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress warning messages
global.console.warn = function() {};

// broadcast-channel should not detect node environment
// https://github.com/pubkey/broadcast-channel/blob/master/src/util.js#L61
process[Symbol.toStringTag] = 'Process';

if (global.document) {
  let docHidden = false;
  Object.defineProperty(global.document, 'hidden', {
    configurable: true,
    get () { return docHidden; },
    set (bool) { docHidden = Boolean(bool); }
  });
}
