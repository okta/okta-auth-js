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
/* global window, document, btoa, atob */

// converts a string to base64 (url/filename safe variant)
export function stringToBase64Url(str) {
  var b64 = btoa(str);
  return base64ToBase64Url(b64);
}

// converts a standard base64-encoded string to a "url/filename safe" variant
export function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// converts a "url/filename safe" base64 string to a "standard" base64 string
export function base64UrlToBase64(b64u) {
  return b64u.replace(/-/g, '+').replace(/_/g, '/');
}

export function base64UrlToString(b64u) {
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

export function stringToBuffer(str) {
  var buffer = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

export function base64UrlDecode(str) {
  return atob(base64UrlToBase64(str));
}

export function bind(fn, ctx) {
  var additionalArgs = Array.prototype.slice.call(arguments, 2);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args = additionalArgs.concat(args);
    return fn.apply(ctx, args);
  };
}

export function isAbsoluteUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

export function isString(obj: any): obj is string {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj: any): obj is object {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isNumber(obj: any): obj is number {
  return Object.prototype.toString.call(obj) === '[object Number]';
}

export function isoToUTCString(str) {
  var parts = str.match(/\d+/g),
      isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
      isoDate = new Date(isoTime);

  return isoDate.toUTCString();
}

export function toQueryParams(obj) {
  var str = [];
  if (obj !== null) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) &&
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

export function genRandomString(length) {
  var randomCharset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var random = '';
  for (var c = 0, cl = randomCharset.length; c < length; ++c) {
    random += randomCharset[Math.floor(Math.random() * cl)];
  }
  return random;
}

// TODO: replace all references with `Object.assign` then remove this function
export function extend() {
  // First object will be modified!
  var obj1 = arguments[0];
  // Properties from other objects will be copied over
  var objArray = [].slice.call(arguments, 1);
  objArray.forEach(function(obj) {
    for (var prop in obj) {
      // copy over all properties with defined values
      if (Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== undefined) {
        obj1[prop] = obj[prop];
      }
    }
  });
  return obj1; // return the modified object
}

export function removeNils(obj) {
  var cleaned = {};
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      var value = obj[prop];
      if (value !== null && value !== undefined) {
        cleaned[prop] = value;
      }
    }
  }
  return cleaned;
}

export function clone(obj) {
  if (obj) {
    var str = JSON.stringify(obj);
    if (str) {
      return JSON.parse(str);
    }
  }
  return obj;
}

// Analogous to _.omit
export function omit(obj, ...props: any[]) {
  // var props = Array.prototype.slice.call(arguments, 1);
  var newobj = {};
  for (var p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p) && props.indexOf(p) == -1) {
      newobj[p] = obj[p];
    }
  }
  return clone(newobj);
}

export function find(collection, searchParams) {
  var c = collection.length;
  while (c--) {
    var item = collection[c];
    var found = true;
    for (var prop in searchParams) {
      if (!Object.prototype.hasOwnProperty.call(searchParams, prop)) {
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

export function getLink(obj, linkName, altName?) {
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

export function getNativeConsole() {
  if (typeof window !== 'undefined') {
    return window.console;
  } else if (typeof console !== 'undefined') {
    return console;
  } else {
    return undefined;
  }
}

export function getConsole() {
  var nativeConsole = getNativeConsole();
  if (nativeConsole && nativeConsole.log) {
    return nativeConsole;
  }
  return {
    log: function() {}
  };
}

export function warn(text) {
  /* eslint-disable no-console */
  getConsole().log('[okta-auth-sdk] WARN: ' + text);
  /* eslint-enable */
}

export function deprecate(text) {
  /* eslint-disable no-console */
  getConsole().log('[okta-auth-sdk] DEPRECATION: ' + text);
  /* eslint-enable */
}

export function deprecateWrap(text, fn) {
  return function() {
    deprecate(text);
    return fn.apply(null, arguments);
  };
}

export function removeTrailingSlash(path) {
  if (!path) {
    return;
  }
  // Remove any whitespace before or after string
  var trimmed = path.replace(/^\s+|\s+$/gm,'');
  // Remove trailing slash(es)
  trimmed = trimmed.replace(/\/+$/, '');

  return trimmed;
}

export function isIE11OrLess() {
  return !!document.documentMode && document.documentMode <= 11;
}

export function isFunction(fn: any): fn is Function {
  return !!fn && {}.toString.call(fn) === '[object Function]';
}

export function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

export function isPromise(obj) {
  return obj && obj.finally && (typeof obj.finally === 'function');
}

// browser only
export function getUrlParts(url) {
  const a = document.createElement('a');
  a.href = url;

  return {
    href: a.href,
    host: a.host,
    hostname: a.hostname,
    port: a.port,
    pathname: a.pathname,
    protocol: a.protocol,
    hash: a.hash,
    search: a.search
  };
}
