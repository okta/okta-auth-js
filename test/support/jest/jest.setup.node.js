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


// Running in a "node" environment so there should be no window
if (typeof window !== 'undefined') {
  throw new Error('server tests should be run in a node environment');
}

// Polyfill a few things

// needed by base64.ts
if (typeof global.btoa === 'undefined') {
  global.btoa = require('btoa');
}
if (typeof global.atob === 'undefined') {
  global.atob = require('atob');
}

// Promise.allSettled is added in Node 12.10
// Needed by tests
if (typeof Promise.allSettled === 'undefined') {
  require('promise.allsettled').shim();
}