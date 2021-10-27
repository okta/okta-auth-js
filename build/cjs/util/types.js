"use strict";

exports.isString = isString;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isFunction = isFunction;
exports.isPromise = isPromise;

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
function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isNumber(obj) {
  return Object.prototype.toString.call(obj) === '[object Number]';
}

function isFunction(fn) {
  return !!fn && {}.toString.call(fn) === '[object Function]';
}

function isPromise(obj) {
  return obj && obj.finally && typeof obj.finally === 'function';
}
//# sourceMappingURL=types.js.map