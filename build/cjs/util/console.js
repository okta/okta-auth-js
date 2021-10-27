"use strict";

exports.getNativeConsole = getNativeConsole;
exports.getConsole = getConsole;
exports.warn = warn;
exports.deprecate = deprecate;
exports.deprecateWrap = deprecateWrap;

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

/* global window */
function getNativeConsole() {
  if (typeof window !== 'undefined') {
    return window.console;
  } else if (typeof console !== 'undefined') {
    return console;
  } else {
    return undefined;
  }
}

function getConsole() {
  var nativeConsole = getNativeConsole();

  if (nativeConsole && nativeConsole.log) {
    return nativeConsole;
  }

  return {
    log: function () {},
    warn: function () {},
    group: function () {},
    groupEnd: function () {}
  };
}

function warn(text) {
  /* eslint-disable no-console */
  getConsole().warn('[okta-auth-sdk] WARN: ' + text);
  /* eslint-enable */
}

function deprecate(text) {
  /* eslint-disable no-console */
  getConsole().warn('[okta-auth-sdk] DEPRECATION: ' + text);
  /* eslint-enable */
}

function deprecateWrap(text, fn) {
  return function () {
    deprecate(text);
    return fn.apply(null, arguments);
  };
}
//# sourceMappingURL=console.js.map