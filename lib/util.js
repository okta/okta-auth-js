/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/* eslint-env es6 */
function base64UrlToBase64(b64u) {
  return b64u.replace(/\-/g, '+').replace(/_/g, '/');
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
      throw 'Not a valid Base64Url';
  }
  var utf8 = atob(b64);
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
  return atob(base64UrlToBase64(str));
}


function bind(fn, ctx) {
  var additionalArgs = Array.prototype.slice.call(arguments, 2);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args = additionalArgs.concat(args);
    return fn.apply(ctx, args);
  };
}

function isAbsoluteUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isNumber(obj) {
  return Object.prototype.toString.call(obj) === '[object Number]';
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function isoToUTCString(str) {
  var parts = str.match(/\d+/g),
      isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
      isoDate = new Date(isoTime);

  return isoDate.toUTCString();
}

function toQueryParams(obj) {
  var str = [];
  if (obj !== null) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) &&
          obj[key] !== undefined &&
          obj[key] !== null) {
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

function genRandomString(length) {
  var randomCharset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var random = '';
  for (var c = 0, cl = randomCharset.length; c < length; ++c) {
    random += randomCharset[Math.floor(Math.random() * cl)];
  }
  return random;
}

function extend(obj1, obj2) {
  for (var prop in obj2) {
    if (obj2.hasOwnProperty(prop)) {
      obj1[prop] = obj2[prop];
    }
  }
}

function removeNils(obj) {
  var cleaned = {};
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var value = obj[prop];
      if (value !== null && value !== undefined) {
        cleaned[prop] = value;
      }
    }
  }
  return cleaned;
}

function clone(obj) {
  if (obj) {
    var str = JSON.stringify(obj);
    if (str) {
      return JSON.parse(str);
    }
  }
  return obj;
}

// Analogous to _.omit
function omit(obj) {
  var props = Array.prototype.slice.call(arguments, 1);
  var newobj = {};
  for (var p in obj) {
    if (obj.hasOwnProperty(p) && props.indexOf(p) == -1) {
      newobj[p] = obj[p];
    }
  }
  return clone(newobj);
}

function find(collection, searchParams) {
  var c = collection.length;
  while (c--) {
    var item = collection[c];
    var found = true;
    for (var prop in searchParams) {
      if (!searchParams.hasOwnProperty(prop)) {
        continue;
      }
      if (item[prop] !== searchParams[prop]) {
        found = false;
        break;
      }
    }
    if (found) {
      return item;
    }
  }
}

function getLink(obj, linkName, altName) {
  if (!obj || !obj._links) {
    return;
  }
  
  var link = clone(obj._links[linkName]);

  // If a link has a name and we have an altName, return if they match
  if (link && link.name && altName) {
    if (link.name === altName) {
      return link;
    }
  } else {
    return link;
  }
}

function deprecate(text) {
  /* eslint-disable no-console */
  console.log('[okta-auth-sdk] DEPRECATION: ' + text);
  /* eslint-enable */
}

function deprecateWrap(text, fn) {
  return function() {
    deprecate(text);
    return fn.apply(null, arguments);
  };
}

module.exports = {
  base64UrlToBase64: base64UrlToBase64,
  base64UrlToString: base64UrlToString,
  stringToBuffer: stringToBuffer,
  base64UrlDecode: base64UrlDecode,
  bind: bind,
  isAbsoluteUrl: isAbsoluteUrl,
  isString: isString,
  isObject: isObject,
  isNumber: isNumber,
  isArray: isArray,
  isoToUTCString: isoToUTCString,
  toQueryParams: toQueryParams,
  genRandomString: genRandomString,
  extend: extend,
  removeNils: removeNils,
  clone: clone,
  omit: omit,
  find: find,
  getLink: getLink,
  deprecate: deprecate,
  deprecateWrap: deprecateWrap
};
