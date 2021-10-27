"use strict";

exports.isAbsoluteUrl = isAbsoluteUrl;
exports.toAbsoluteUrl = toAbsoluteUrl;
exports.toRelativeUrl = toRelativeUrl;
exports.toQueryString = toQueryString;
exports.removeTrailingSlash = removeTrailingSlash;

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
function isAbsoluteUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

function toAbsoluteUrl(url = '', baseUrl) {
  if (isAbsoluteUrl(url)) {
    return url;
  }

  baseUrl = removeTrailingSlash(baseUrl);
  return url[0] === '/' ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

function toRelativeUrl(url = '', baseUrl) {
  if (isAbsoluteUrl(url)) {
    url = url.substring(baseUrl.length);
  }

  return url[0] === '/' ? url : `/${url}`;
}

function toQueryString(obj) {
  var str = [];

  if (obj !== null) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
  }

  if (str.length) {
    return '?' + str.join('&');
  } else {
    return '';
  }
}

function removeTrailingSlash(path) {
  if (!path) {
    return;
  } // Remove any whitespace before or after string


  var trimmed = path.replace(/^\s+|\s+$/gm, ''); // Remove trailing slash(es)

  trimmed = trimmed.replace(/\/+$/, '');
  return trimmed;
}
//# sourceMappingURL=url.js.map