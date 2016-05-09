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

/* globals process, console, SDK_VERSION */
/*jshint maxcomplexity:15 */

require('./vendor/polyfills');

var Q                 = require('q');
var util              = require('./util');
var sdkCrypto         = require('./crypto');
var ajaxRequest       = require('ajaxRequest'); // request type determined at build time
var OAuthError        = require('./errors/OAuthError');
var AuthApiError      = require('./errors/AuthApiError');
var AuthSdkError      = require('./errors/AuthSdkError');
var AuthPollStopError = require('./errors/AuthPollStopError');

var LOG_PREFIX = '[OktaAuth]';
var STATE_TOKEN_COOKIE_NAME = 'oktaStateToken';
var FRAME_ID = 'okta-oauth-helper-frame';
var DEFAULT_POLLING_DELAY = 500;
var DEBUG = false;
var IS_NODE = 'object' === typeof process && Object.prototype.toString.call(process) === '[object process]';
var IS_BROWSER = !IS_NODE;

// LOGGING
function print(fn, args) {
  if (DEBUG) {
    var consoleArgs = Array.prototype.slice.call(args);
    consoleArgs.unshift(LOG_PREFIX + ' ');
    fn.apply(console, consoleArgs);
  }
}

function log() {
  if (typeof console !== 'undefined' && console.log) {
    return print(console.log, arguments);
  }
}

function error() {
  if (typeof console !== 'undefined' && console.error) {
    return print(console.error, arguments);
  }
}

// UTILS
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

function isoToDate(str) {
  var parts = str.match(/\d+/g),
      isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]),
      isoDate = new Date(isoTime);

  return isoDate;
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

function setCookie(name, value, expiresAt) {
  if (!IS_BROWSER) {
    return;
  }

  var expiresText = '';
  if (expiresAt) {
    expiresText = ' expires=' + isoToDate(expiresAt).toUTCString() + ';';
  }

  var cookieText = name + '=' + value + ';' + expiresText;
  log('Set cookie: ' + cookieText);
  document.cookie = cookieText;

  return cookieText;
}

function getCookie(name) {
  if (!IS_BROWSER) {
    return;
  }

  var pattern = new RegExp(name + '=([^;]*)'),
    matched = document.cookie.match(pattern);

  if (matched) {
    var cookie = matched[1];
    log('Got cookie: ', cookie);
    return cookie;
  }
}

function deleteCookie(name) {
  setCookie(name, '', '1970-01-01T00:00:00Z');
}

function addStateToken(res, options) {
  var builtArgs = clone(options) || {};

  // Add the stateToken if one isn't passed and we have one
  if (!builtArgs.stateToken && res.stateToken) {
    builtArgs.stateToken = res.stateToken;
  }

  return builtArgs;
}

function getStateToken(res) {
  return addStateToken(res);
}

function AuthTransaction(sdk, res) {
  if (res) {
    this.data = res;
    extend(this, flattenEmbedded(sdk, res, res, {}));
    delete this.stateToken;

    // RECOVERY_CHALLENGE has some responses without _links.
    // Without _links, we emulate cancel to make it intuitive
    // to return to the starting state. We may remove this
    // when OKTA-75434 is resolved
    if (res.status === 'RECOVERY_CHALLENGE' && !res._links) {
      this.cancel = function() {
        return new Q(new AuthTransaction(sdk));
      };
    }
  }
}

function postToTransaction(sdk, url, options) {
  return post(sdk, url, options)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function getPollFn(sdk, res, ref) {
  return function (delay) {
    if (!delay && delay !== 0) {
      delay = DEFAULT_POLLING_DELAY;
    }

    // Get the poll function
    var pollLink = getLink(res, 'next', 'poll');
    function pollFn() {
      return post(sdk, pollLink.href, getStateToken(res), true, true);
    }

    ref.isPolling = true;

    var retryCount = 0;
    var recursivePoll = function () {

      // If the poll was manually stopped during the delay
      if (!ref.isPolling) {
        return Q.reject(new AuthPollStopError());
      }

      return pollFn()
        .then(function (pollRes) {
          // Reset our retry counter on success
          retryCount = 0;

          // If we're still waiting
          if (pollRes.factorResult && pollRes.factorResult === 'WAITING') {

            // If the poll was manually stopped while the pollFn was called
            if (!ref.isPolling) {
              throw new AuthPollStopError();
            }

            // Continue poll
            return Q.delay(delay)
              .then(recursivePoll);

          } else {
            // Any non-waiting result, even if polling was stopped
            // during a request, will return
            ref.isPolling = false;
            return new AuthTransaction(sdk, pollRes);
          }
        })
        .fail(function(err) {
          // Exponential backoff, up to 16 seconds
          if (err.xhr &&
              (err.xhr.status === 0 || err.xhr.status === 429) &&
              retryCount <= 4) {
            var delayLength = Math.pow(2, retryCount) * 1000;
            retryCount++;
            return Q.delay(delayLength)
              .then(recursivePoll);
          }
          throw err;
        });
    };
    return recursivePoll()
      .fail(function(err) {
        ref.isPolling = false;
        throw err;
      });
  };
}

function link2fn(sdk, res, obj, link, ref) {
  if (Array.isArray(link)) {
    return function(name, opts) {
      if (!name) {
        throw new AuthSdkError('Must provide a link name');
      }

      var lk = find(link, {name: name});
      if (!lk) {
        throw new AuthSdkError('No link found for that name');
      }

      return link2fn(sdk, res, obj, lk, ref)(opts);
    };

  } else if (link.hints &&
      link.hints.allow &&
      link.hints.allow.length === 1) {
    var method = link.hints.allow[0];
    switch (method) {

      case 'GET':
        return function() {
          return get(sdk, link.href);
        };

      case 'POST':
        return function(opts) {
          if (ref && ref.isPolling) {
            ref.isPolling = false;
          }

          var data = addStateToken(res, opts);

          if (res.status === 'MFA_ENROLL') {
            // Add factorType and provider
            extend(data, {
              factorType: obj.factorType,
              provider: obj.provider
            });
          }

          var href = link.href;
          if (data.rememberDevice !== undefined) {
            if (data.rememberDevice) {
              href += '?rememberDevice=true';
            }
            data = omit(data, 'rememberDevice');

          } else if (data.profile &&
                    data.profile.updatePhone !== undefined) {
            if (data.profile.updatePhone) {
              href += '?updatePhone=true';
            }
            data.profile = omit(data.profile, 'updatePhone');
          }

          return postToTransaction(sdk, href, data);
        };
    }
  }
}

function links2fns(sdk, res, obj, ref) {
  var fns = {};
  for (var linkName in obj._links) {
    if (!obj._links.hasOwnProperty(linkName)) {
      continue;
    }

    var link = obj._links[linkName];
    
    if (linkName === 'next') {
      linkName = link.name;
    }

    if (link.type) {
      fns[linkName] = link;
      continue;
    }

    switch (linkName) {
      // poll is only found at the transaction
      // level, so we don't need to pass the link
      case 'poll':
        fns.poll = getPollFn(sdk, res, ref);
        break;

      default:
        var fn = link2fn(sdk, res, obj, link, ref);
        if (fn) {
          fns[linkName] = fn;
        }
    }
  }
  return fns;
}

function flattenEmbedded(sdk, res, obj, ref) { /* jshint ignore:line */
  obj = obj || res;
  obj = clone(obj);

  if (Array.isArray(obj)) {
    var objArr = [];
    for (var o = 0, ol = obj.length; o < ol; o++) {
      objArr.push(flattenEmbedded(sdk, res, obj[o], ref));
    }
    return objArr;
  }

  var embedded = obj._embedded || {};

  for (var key in embedded) {
    if (!embedded.hasOwnProperty(key)) {
      continue;
    }

    // Flatten any nested _embedded objects
    embedded[key] = flattenEmbedded(sdk, res, embedded[key], ref);
  }

  // Convert any links on the embedded object
  var fns = links2fns(sdk, res, obj, ref);
  extend(embedded, fns);

  obj = omit(obj, '_embedded', '_links');
  extend(obj, embedded);
  return obj;
}

// HTTP METHODS

function httpRequest(sdk, url, method, args, dontSaveResponse) {
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Okta-SDK': 'okta-auth-js-' + SDK_VERSION
  };
  extend(headers, sdk.options.headers || {});

  var options = {
    headers: headers,
    data: args || undefined
  };

  log('Request: ', method, url, options);

  var err, res;
  return new Q(sdk.options.ajaxRequest(method, url, options))
    .then(function(resp) {
      log('Response: ', resp);

      res = resp.responseText;
      if (res && isString(res)) {
        res = JSON.parse(res);
      }

      if (!dontSaveResponse) {
        if (!res.stateToken) {
          deleteCookie(STATE_TOKEN_COOKIE_NAME);
        }
      }

      if (res && res.stateToken && res.expiresAt) {
        setCookie(STATE_TOKEN_COOKIE_NAME, res.stateToken, res.expiresAt);
      }

      return res;
    })
    .fail(function(resp) { 
      var serverErr = resp.responseText || {};
      if (isString(serverErr)) {
        try {
          serverErr = JSON.parse(serverErr);
        } catch (e) {
          serverErr = {
            errorSummary: 'Unknown error'
          };
        }
      }

      if (resp.status >= 500) {
        serverErr.errorSummary = 'Unknown error';
      }

      error('Error: ' + resp);

      if (sdk.options.transformErrorXHR) {
        resp = sdk.options.transformErrorXHR(clone(resp));
      }

      err = new AuthApiError(serverErr, resp);

      if (err.errorCode === 'E0000011') {
        deleteCookie(STATE_TOKEN_COOKIE_NAME);
      }

      throw err;
    });
}

function get(sdk, url, saveResponse) { /* jshint ignore:line */
  url = isAbsoluteUrl(url) ? url : sdk.options.url + url;
  return httpRequest(sdk, url, 'GET', undefined, !saveResponse);
}

function post(sdk, url, args, dontSaveResponse) { /* jshint ignore:line */
  url = isAbsoluteUrl(url) ? url : sdk.options.url + url;
  return httpRequest(sdk, url, 'POST', args, dontSaveResponse);
}

function OktaAuth(args) {
  var sdk = this;

  if (!(this instanceof OktaAuth)) {
    return new OktaAuth(args);
  }

  if (!args) {
    throw new AuthSdkError('No arguments passed to constructor. ' +
      'Required usage: new OktaAuth(args)');
  }

  if (!args.url) {
    throw new AuthSdkError('No url passed to constructor. ' +
      'Required usage: new OktaAuth({url: "https://sample.okta.com"})');
  }

  DEBUG = args.debug;

  this.options = {
    url: args.url,
    clientId: args.clientId,
    redirectUri: args.redirectUri,
    ajaxRequest: args.ajaxRequest || ajaxRequest,
    transformErrorXHR: args.transformErrorXHR,
    headers: args.headers
  };

  // Remove trailing forward slash from url
  if (this.options.url.slice(-1) === '/') {
    this.options.url = this.options.url.slice(0, -1);
  }

  sdk.session = {
    close: bind(closeSession, sdk, sdk),
    exists: bind(sessionExists, sdk, sdk),
    get: bind(getSession, sdk, sdk),
    refresh: bind(refreshSession, sdk, sdk),
    setCookieAndRedirect: bind(setCookieAndRedirect, sdk, sdk)
  };

  sdk.tx = {
    status: bind(transactionStatus, sdk, sdk),
    resume: bind(resumeTransaction, sdk, sdk),
    exists: bind(transactionExists, sdk, sdk)
  };

  // This is exposed so we can mock document.cookie in our tests
  sdk.tx.exists._getCookie = function(name) {
    return getCookie(name);
  };

  sdk.idToken = {
    authorize: bind(getIdToken, sdk, sdk),
    verify: bind(verifyIdToken, sdk, sdk),
    refresh: bind(refreshIdToken, sdk, sdk),
    decode: bind(decodeIdToken, sdk)
  };

  // This is exposed so we can mock window.location.href in our tests
  sdk.idToken.authorize._getLocationHref = function() {
    return window.location.href;
  };

  log('OktaAuth created');
}

var proto = OktaAuth.prototype;

proto.features = {};

proto.features.isPopupPostMessageSupported = function() {
  var isIE8or9 = document.documentMode && document.documentMode < 10;
  if (window.postMessage && !isIE8or9) {
    return true;
  }
  return false;
};

proto.features.isTokenVerifySupported = function() {
  return typeof crypto !== 'undefined' && crypto.subtle && typeof Uint8Array !== 'undefined';
};

// { username, password, (relayState), (context) }
proto.signIn = function (opts) {
  return postToTransaction(this, '/api/v1/authn', opts);
};

proto.signOut = function () {
  return this.session.close();
};

// { username, (relayState) }
proto.forgotPassword = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
};

// { username, (relayState) }
proto.unlockAccount = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
};

// { recoveryToken }
proto.verifyRecoveryToken = function (opts) {
  return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
};

function transactionStatus(sdk, args) { /* jshint ignore:line */
  args = addStateToken(this, args);
  return post(this, sdk.options.url + '/api/v1/authn', args);
}

function resumeTransaction(sdk, args) { /* jshint ignore:line */
  if (!args || !args.stateToken) {
    var stateToken = sdk.tx.exists._getCookie(STATE_TOKEN_COOKIE_NAME);
    if (stateToken) {
      args = {
        stateToken: stateToken
      };
    } else {
      return Q.reject(new AuthSdkError('No transaction to resume'));
    }
  }
  return sdk.tx.status(args)
    .then(function(res) {
      return new AuthTransaction(sdk, res);
    });
}

function transactionExists(sdk) { /* jshint ignore:line */
  // We have a cookie state token
  return !!sdk.tx.exists._getCookie(STATE_TOKEN_COOKIE_NAME);
}

function getWellKnown(sdk) {
  return get(sdk, sdk.options.url + '/.well-known/openid-configuration');
}

function validateClaims(claims, iss, aud) {
  if (!claims || !iss || !aud) {
    throw new AuthSdkError('The jwt, iss, and aud arguments are all required');
  }

  var now = Math.floor(new Date().getTime()/1000);

  if (claims.iss !== iss) {
    throw new AuthSdkError('The issuer [' + claims.iss + '] ' +
      'does not match [' + iss + ']');
  }

  if (claims.aud !== aud) {
    throw new AuthSdkError('The audience [' + claims.aud + '] ' +
      'does not match [' + aud + ']');
  }

  if (claims.iat > claims.exp) {
    throw new AuthSdkError('The JWT expired before it was issued');
  }

  if (now > claims.exp) {
    throw new AuthSdkError('The JWT expired and is no longer valid');
  }

  if (claims.iat > now) {
    throw new AuthSdkError('The JWT was issued in the future');
  }
}

function decodeIdToken(idToken) { /* jshint ignore:line */
  var jwt = idToken.split('.');
  var decodedToken;

  try {
    decodedToken = {
      header: JSON.parse(util.base64UrlToString(jwt[0])),
      payload: JSON.parse(util.base64UrlToString(jwt[1])),
      signature: jwt[2]
    };
  } catch(e) {
    throw new AuthSdkError('Malformed idToken');
  }

  return decodedToken;
}

function verifyIdToken(sdk, idToken, options) { /* jshint ignore:line */
  options = options || {};

  if (!sdk.features.isTokenVerifySupported()) {
    return Q.reject(new AuthSdkError('This browser doesn\'t support crypto.subtle'));
  }

  function isExpired(jwtExp) {
    var expirationTime;
    if (options.expirationTime || options.expirationTime === 0) {
      expirationTime = options.expirationTime;
    } else {
      expirationTime = Math.floor(Date.now()/1000);
    }
    if (jwtExp &&
        jwtExp > expirationTime) {
      return true;
    }
  }

  function hasAudience(jwtAudience) {
    if (!options.audience) {
      return true;
    }
    var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
    var jwtAudiences = Array.isArray(jwtAudience) ? jwtAudience : [jwtAudience];
    var ai = audiences.length;
    while (ai--) {
      var aud = audiences[ai];
      if (jwtAudiences.indexOf(aud) !== -1) {
        return true;
      }
    }
  }

  return getWellKnown(sdk)
    .then(function(res) {
      return get(sdk, res['jwks_uri']);
    })
    .then(function(res) {
      var key = res.keys[0];
      return sdkCrypto.verifyToken(idToken, key);
    })
    .then(function(res) {
      if (!res) {
        return false;
      }
      var jwt = sdk.idToken.decode(idToken);

      if (isExpired(jwt.payload.exp)) {
        return false;
      }

      if (!hasAudience(jwt.payload.aud)) {
        return false;
      }

      if (options.issuer &&
          options.issuer !== jwt.payload.iss) {
        return false;
      }

      return true;
    });
}

function refreshIdToken(sdk, opts) { /* jshint ignore:line */
  opts = opts || {};
  opts.display = null;
  opts.prompt = 'none';
  return getIdToken(sdk, opts);
}

function loadFrame(src, iframeId) {
  if (typeof iframeId === 'undefined') {
    return;
  }

  var iframe = document.getElementById(iframeId);
  if (iframe) {
    return iframe;
  }
  
  iframe = document.createElement('iframe');
  iframe.setAttribute('id', iframeId);
  iframe.style.display = 'none';
  iframe.src = src;

  return document.body.appendChild(iframe);
}

function loadPopup(src, options) {
  var title = options.popupTitle || 'External Identity Provider User Authentication';
  var appearance = 'toolbar=no, scrollbars=yes, resizable=yes, ' +
    'top=100, left=500, width=600, height=600';
  return window.open(src, title, appearance);
}

function addListener(eventTarget, name, fn) {
    if (eventTarget.addEventListener) {
      eventTarget.addEventListener(name, fn);
    } else {
      eventTarget.attachEvent('on' + name, fn);
    }
  }

function removeListener(eventTarget, name, fn) {
  if (eventTarget.removeEventListener) {
    eventTarget.removeEventListener(name, fn);
  } else {
    eventTarget.detachEvent('on' + name, fn);
  }
}

function addPostMessageListener(sdk, timeout) {
  var deferred = Q.defer();

  function responseHandler(e) {
    if (!e.data || e.origin !== sdk.options.url) {
      return;
    }
    deferred.resolve(e.data);
  }

  addListener(window, 'message', responseHandler);

  return deferred.promise.timeout(timeout || 120000, new AuthSdkError('OAuth flow timed out'))
    .fin(function() {
      removeListener(window, 'message', responseHandler);
    });
}

function addFragmentListener(sdk, windowEl, timeout) {
  var deferred = Q.defer();

  // Predefine regexs for parsing hash
  var plus2space = /\+/g;
  var paramSplit = /([^&=]+)=?([^&]*)/g;

  function hashToObject(hash) {
    // Remove the leading hash
    var fragment = hash.substring(1);

    var obj = {};

    // Loop until we have no more params
    var param;
    while (true) {
      param = paramSplit.exec(fragment);
      if (!param) { break; }

      var key = param[1];
      var value = param[2];

      // id_token should remain base64url encoded
      if (key === 'id_token') {
        obj[key] = value;
      } else {
        obj[key] = decodeURIComponent(value.replace(plus2space, ' '));
      }
    }
    return obj;
  }

  function hashChangeHandler() {
    /*
      We are only able to access window.location.hash on a window
      that has the same domain. A try/catch is necessary because
      there's no other way to determine that the popup is in
      another domain. When we try to access a window on another 
      domain, an error is thrown.
    */
    try {
      if (windowEl &&
          windowEl.location &&
          windowEl.location.hash) {
        deferred.resolve(hashToObject(windowEl.location.hash));
      } else if (windowEl && !windowEl.closed) {
        setTimeout(hashChangeHandler, 500);
      }
    } catch (err) {
      setTimeout(hashChangeHandler, 500);
    }
  }

  hashChangeHandler();

  return deferred.promise.timeout(timeout || 120000, new AuthSdkError('OAuth flow timed out'));
}

/*
 * Retrieve an idToken from an Okta or a third party idp
 * 
 * Two main flows:
 *
 *  1) Exchange a sessionToken for an idToken
 * 
 *    Required:
 *      clientId: passed via the OktaAuth constructor or into getIdToken
 *      sessionToken: 'yourtoken'
 *
 *    Optional:
 *      redirectUri: defaults to window.location.href
 *      scopes: defaults to ['openid', 'email']
 *
 *    Forced:
 *      prompt: 'none'
 *      responseMode: 'okta_post_message'
 *      display: undefined
 *
 *  2) Get an idToken from an idp
 *
 *    Required:
 *      clientId: passed via the OktaAuth constructor or into getIdToken
 *
 *    Optional:
 *      redirectUri: defaults to window.location.href
 *      scopes: defaults to ['openid', 'email']
 *      idp: defaults to Okta as an idp
 *      prompt: no default. Pass 'none' to throw an error if user is not signed in
 *
 *    Forced:
 *      display: 'popup'
 *
 *  Only common optional params shown. Any OAuth parameters not explicitly forced are available to override
 *
 * @param {Object} oauthOptions
 * @param {String} [oauthOptions.clientId] ID of this client
 * @param {String} [oauthOptions.redirectUri] URI that the iframe or popup will go to once authenticated
 * @param {String[]} [oauthOptions.scopes] OAuth 2.0 scopes to request (openid must be specified)
 * @param {String} [oauthOptions.idp] ID of an external IdP to use for user authentication
 * @param {String} [oauthOptions.sessionToken] Bootstrap Session Token returned by the Okta Authentication API
 * @param {String} [oauthOptions.prompt] Determines whether the Okta login will be displayed on failure.
 *                                       Use 'none' to prevent this behavior
 *
 * @param {Object} options
 * @param {Integer} [options.timeout] Time in ms before the flow is automatically terminated. Defaults to 120000
 * @param {String} [options.popupTitle] Title dispayed in the popup.
 *                                      Defaults to 'External Identity Provider User Authentication'
 */
function getIdToken(sdk, oauthOptions, options) { /* jshint ignore:line */
  if (!oauthOptions) {
    oauthOptions = {};
  }

  if (!options) {
    options = {};
  }

  // Default OAuth query params
  var oauthParams = {
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    responseType: 'id_token',
    responseMode: 'okta_post_message',
    state: genRandomString(64),
    nonce: genRandomString(64),
    scope: ['openid', 'email']
  };

  // Add user-provided options
  extend(oauthParams, oauthOptions);

  // Start overriding any options that don't make sense
  var sessionTokenOverrides = {
    prompt: 'none',
    responseMode: 'okta_post_message',
    display: null
  };

  var idpOverrides = {
    display: 'popup'
  };

  if (oauthOptions.sessionToken) {
    extend(oauthParams, sessionTokenOverrides);
  } else if (oauthOptions.idp) {
    extend(oauthParams, idpOverrides);
  }

  // Quick validation
  if (!oauthParams.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get an idToken');
  }

  // Convert our params to their actual OAuth equivalents
  var oauthQueryHash = removeNils({
    'client_id': oauthParams.clientId,
    'redirect_uri': oauthParams.redirectUri,
    'response_type': oauthParams.responseType,
    'response_mode': oauthParams.responseMode,
    'state': oauthParams.state,
    'nonce': oauthParams.nonce,
    'prompt': oauthParams.prompt,
    'display': oauthParams.display,
    'sessionToken': oauthParams.sessionToken,
    'idp': oauthParams.idp
  });

  if (oauthParams.scope.indexOf('openid') !== -1) {
    oauthQueryHash.scope = oauthParams.scope.join(' ');
  } else {
    throw new AuthSdkError('openid scope must be specified in the scope argument');
  }

  // Use the query params to build the authorize url
  var requestUrl = sdk.options.url + '/oauth2/v1/authorize' + toQueryParams(oauthQueryHash);

  // Determine the flow type
  var flowType;
  if (oauthParams.sessionToken || oauthParams.display === null) {
    flowType = 'IFRAME';
  } else if (oauthParams.display === 'popup') {
    flowType = 'POPUP';
  } else {
    flowType = 'IMPLICIT';
  }

  function handleOAuthResponse(res) {
    if (res['error'] || res['error_description']) {
      throw new OAuthError(res['error'], res['error_description']);

    } else if (res['id_token']) {
      if (res.state !== oauthParams.state) {
        throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
      }
      if (res.nonce !== oauthParams.nonce) {
        throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
      }
      var jwt = sdk.idToken.decode(res['id_token']);
      validateClaims(jwt.payload, sdk.options.url, oauthParams.clientId);
      return {
        idToken: res['id_token'],
        claims: jwt.payload
      };

    } else {
      throw new AuthSdkError('Unable to parse OAuth flow response');
    }
  }

  function getOrigin(url) {
    var originRegex = /^(https?\:\/\/)?([^:\/?#]*(?:\:[0-9]+)?)/;
    return originRegex.exec(url)[0];
  }

  // Execute the flow type
  switch (flowType) {
    case 'IFRAME':
      var iframePromise = addPostMessageListener(sdk, options.timeout);
      var iframeEl = loadFrame(requestUrl, FRAME_ID);
      return iframePromise
        .then(handleOAuthResponse)
        .fin(function() {
          if (document.body.contains(iframeEl)) {
            iframeEl.parentElement.removeChild(iframeEl);
          }
        });

    case 'POPUP':
      var popupPromise;

      // Add listener on postMessage before window creation, so
      // postMessage isn't triggered before we're listening
      if (oauthParams.responseMode === 'okta_post_message') {
        if (!sdk.features.isPopupPostMessageSupported()) {
          return Q.reject(new AuthSdkError('This browser doesn\'t have full postMessage support'));
        }
        popupPromise = addPostMessageListener(sdk, options.timeout);
      }

      // Create the window
      var windowOptions = {
        popupTitle: options.popupTitle
      };
      var windowEl = loadPopup(requestUrl, windowOptions);

      // Poll until we get a valid hash fragment
      if (oauthParams.responseMode === 'fragment') {
        var windowOrigin = getOrigin(sdk.idToken.authorize._getLocationHref());
        var redirectUriOrigin = getOrigin(oauthParams.redirectUri);
        if (windowOrigin !== redirectUriOrigin) {
          return Q.reject(new AuthSdkError('Using fragment, the redirectUri origin (' + redirectUriOrigin +
            ') must match the origin of this page (' + windowOrigin + ')'));
        }
        popupPromise = addFragmentListener(sdk, windowEl, options.timeout);
      }

      // Both postMessage and fragment require a poll to see if the popup closed
      var popupDeferred = Q.defer();
      function hasClosed(win) {
        if (win.closed) {
          popupDeferred.reject(new AuthSdkError('Unable to parse OAuth flow response'));
        }
      }
      var closePoller = setInterval(function() {
        hasClosed(windowEl);
      }, 500);

      // Proxy the promise results into the deferred
      popupPromise
      .then(function(res) {
        popupDeferred.resolve(res);
      })
      .fail(function(err) {
        popupDeferred.reject(err);
      });

      return popupDeferred.promise
        .then(handleOAuthResponse)
        .fin(function() {
          if (!windowEl.closed) {
            clearInterval(closePoller);
            windowEl.close();
          }
        });

    default:
      return Q.reject(new AuthSdkError('The full page redirect flow is not supported'));
  }
}

function sessionExists(sdk) { /* jshint ignore:line */
  return sdk.session.get()
    .then(function(res) {
      if (res.status === 'ACTIVE') {
        return true;
      }
      return false;
    })
    .fail(function() {
      return false;
    });
}

function getSession(sdk) { /* jshint ignore:line */
  return get(sdk, '/api/v1/sessions/me')
  .then(function(session) {
    var res = omit(session, '_links');

    res.refresh = function() {
      return post(sdk, getLink(session, 'refresh').href);
    };

    res.user = function() {
      return get(sdk, getLink(session, 'user').href);
    };

    return res;
  })
  .fail(function() {
    // Return INACTIVE status on failure
    return {status: 'INACTIVE'};
  });
}

function closeSession(sdk) { /* jshint ignore:line */
  return httpRequest(sdk, sdk.options.url + '/api/v1/sessions/me', 'DELETE', undefined, true);
}

function refreshSession(sdk) { /* jshint ignore:line */
  return post(sdk, '/api/v1/sessions/me/lifecycle/refresh');
}

function setCookieAndRedirect(sdk, sessionToken, redirectUrl) { /* jshint ignore:line */
  redirectUrl = redirectUrl || window.location.href;
  window.location = sdk.options.url + '/login/sessionCookieRedirect' +
    toQueryParams({
      checkAccountSetupComplete: true,
      token: sessionToken,
      redirectUrl: redirectUrl
    });
}

module.exports = OktaAuth;
