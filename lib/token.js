/* eslint-disable complexity, max-statements */
var http          = require('./http');
var util          = require('./util');
var Q             = require('q');
var sdkCrypto     = require('./crypto');
var AuthSdkError  = require('./errors/AuthSdkError');
var OAuthError    = require('./errors/OAuthError');
var config        = require('./config');
var cookies       = require('./cookies');

function getWellKnown(sdk) {
  return http.get(sdk, sdk.options.url + '/.well-known/openid-configuration');
}

function validateClaims(sdk, claims, aud) {
  var iss = sdk.options.url;

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

  if ((now - sdk.options.maxClockSkew) > claims.exp) {
    throw new AuthSdkError('The JWT expired and is no longer valid');
  }

  if (claims.iat > (now + sdk.options.maxClockSkew)) {
    throw new AuthSdkError('The JWT was issued in the future');
  }
}

function decodeToken(token) {
  var jwt = token.split('.');
  var decodedToken;

  try {
    decodedToken = {
      header: JSON.parse(util.base64UrlToString(jwt[0])),
      payload: JSON.parse(util.base64UrlToString(jwt[1])),
      signature: jwt[2]
    };
  } catch(e) {
    throw new AuthSdkError('Malformed token');
  }

  return decodedToken;
}

function verifyIdToken(sdk, idToken, options) {
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
      return http.get(sdk, res['jwks_uri']);
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

function refreshIdToken(sdk, opts) {
  opts = opts || {};
  opts.display = null;
  opts.prompt = 'none';
  return getToken(sdk, opts);
}

function loadFrame(src) {
  var iframe = document.createElement('iframe');
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

function addPostMessageListener(sdk, timeout, state) {
  var deferred = Q.defer();

  function responseHandler(e) {
    if (!e.data ||
        e.origin !== sdk.options.url ||
        (e.data && util.isString(state) && e.data.state !== state)) {
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

function hashToObject(hash) {
  // Predefine regexs for parsing hash
  var plus2space = /\+/g;
  var paramSplit = /([^&=]+)=?([^&]*)/g;

  // Remove the leading hash
  var fragment = hash.substring(1);

  var obj = {};

  // Loop until we have no more params
  var param;
  while (true) { // eslint-disable-line no-constant-condition
    param = paramSplit.exec(fragment);
    if (!param) { break; }

    var key = param[1];
    var value = param[2];

    // id_token should remain base64url encoded
    if (key === 'id_token' || key === 'access_token' || key === 'code') {
      obj[key] = value;
    } else {
      obj[key] = decodeURIComponent(value.replace(plus2space, ' '));
    }
  }
  return obj;
}

function addFragmentListener(sdk, windowEl, timeout) {
  var deferred = Q.defer();

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

function handleOAuthResponse(sdk, oauthParams, res) {
  if (res['error'] || res['error_description']) {
    throw new OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
  }

  var tokenTypes = oauthParams.responseType;
  var scopes = util.clone(oauthParams.scopes);
  var tokenDict = {};

  if (res['id_token']) {
    var jwt = sdk.idToken.decode(res['id_token']);
    if (jwt.payload.nonce !== oauthParams.nonce) {
      throw new AuthSdkError('OAuth flow response nonce doesn\'t match request nonce');
    }

    var clientId = oauthParams.clientId || sdk.options.clientId;
    validateClaims(sdk, jwt.payload, clientId);

    var idToken = {
      idToken: res['id_token'],
      claims: jwt.payload,
      expiresAt: jwt.payload.exp,
      scopes: scopes
    };

    if (Array.isArray(tokenTypes)) {
      tokenDict['id_token'] = idToken;
    } else {
      return idToken;
    }
  }
  
  if (res['access_token']) {
    var accessToken = {
      accessToken: res['access_token'],
      expiresAt: Number(res['expires_in']) + Math.floor(Date.now()/1000),
      tokenType: res['token_type'],
      scopes: scopes
    };

    if (Array.isArray(tokenTypes)) {
      tokenDict['token'] = accessToken;
    } else {
      return accessToken;
    }
  }

  if (res['code']) {
    var authorizationCode = {
      authorizationCode: res['code']
    };

    if (Array.isArray(tokenTypes)) {
      tokenDict['code'] = authorizationCode;
    } else {
      return authorizationCode;
    }
  }

  if (!tokenDict['token'] && !tokenDict['id_token']) {
    throw new AuthSdkError('Unable to parse OAuth flow response');
  }

  var tokens = [];

  // Create token array in the order of the responseType array
  for (var t = 0, tl = tokenTypes.length; t < tl; t++) {
    var tokenType = tokenTypes[t];
    if (tokenDict[tokenType]) {
      tokens.push(tokenDict[tokenType]);
    }
  }

  return tokens;
}

function getDefaultOAuthParams(sdk, oauthOptions) {
  oauthOptions = util.clone(oauthOptions) || {};

  if (oauthOptions.scope) {
    util.deprecate('The param "scope" is equivalent to "scopes". Use "scopes" instead.');
    oauthOptions.scopes = oauthOptions.scope;
    delete oauthOptions.scope;
  }

  var defaults = {
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    responseType: 'id_token',
    responseMode: 'okta_post_message',
    state: util.genRandomString(64),
    nonce: util.genRandomString(64),
    scopes: ['openid', 'email']
  };
  util.extend(defaults, oauthOptions);
  return defaults;
}

function convertOAuthParamsToQueryParams(oauthParams) {
  // Quick validation
  if (!oauthParams.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (util.isString(oauthParams.responseType) && oauthParams.responseType.indexOf(' ') !== -1) {
    throw new AuthSdkError('Multiple OAuth responseTypes must be defined as an array');
  }

  // Convert our params to their actual OAuth equivalents
  var oauthQueryParams = util.removeNils({
    'client_id': oauthParams.clientId,
    'redirect_uri': oauthParams.redirectUri,
    'response_type': oauthParams.responseType,
    'response_mode': oauthParams.responseMode,
    'state': oauthParams.state,
    'nonce': oauthParams.nonce,
    'prompt': oauthParams.prompt,
    'display': oauthParams.display,
    'sessionToken': oauthParams.sessionToken,
    'idp': oauthParams.idp,
    'max_age': oauthParams.maxAge
  });

  if (Array.isArray(oauthQueryParams['response_type'])) {
    oauthQueryParams['response_type'] = oauthQueryParams['response_type'].join(' ');
  }

  if (oauthParams.responseType.indexOf('id_token') !== -1 &&
      oauthParams.scopes.indexOf('openid') === -1) {
    throw new AuthSdkError('openid scope must be specified in the scopes argument when requesting an id_token');
  } else {
    oauthQueryParams.scope = oauthParams.scopes.join(' ');
  }

  return oauthQueryParams;
}

function buildAuthorizeUrl(sdk, oauthParams) {
  var oauthQueryParams = convertOAuthParamsToQueryParams(oauthParams);
  return sdk.options.url + '/oauth2/v1/authorize' + util.toQueryParams(oauthQueryParams);
}

/*
 * Retrieve an idToken from an Okta or a third party idp
 * 
 * Two main flows:
 *
 *  1) Exchange a sessionToken for an idToken
 * 
 *    Required:
 *      clientId: passed via the OktaAuth constructor or into getToken
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
 *      clientId: passed via the OktaAuth constructor or into getToken
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
function getToken(sdk, oauthOptions, options) {
  if (!oauthOptions) {
    oauthOptions = {};
  }

  if (!options) {
    options = {};
  }

  // Default OAuth query params
  var oauthParams = getDefaultOAuthParams(sdk, oauthOptions);

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
    util.extend(oauthParams, sessionTokenOverrides);
  } else if (oauthOptions.idp) {
    util.extend(oauthParams, idpOverrides);
  }

  // Use the query params to build the authorize url
  var requestUrl;
  try {
    requestUrl = buildAuthorizeUrl(sdk, oauthParams);
  } catch (e) {
    return Q.reject(e);
  }

  // Determine the flow type
  var flowType;
  if (oauthParams.sessionToken || oauthParams.display === null) {
    flowType = 'IFRAME';
  } else if (oauthParams.display === 'popup') {
    flowType = 'POPUP';
  } else {
    flowType = 'IMPLICIT';
  }

  function getOrigin(url) {
    var originRegex = /^(https?\:\/\/)?([^:\/?#]*(?:\:[0-9]+)?)/;
    return originRegex.exec(url)[0];
  }

  // Execute the flow type
  switch (flowType) {
    case 'IFRAME':
      var iframePromise = addPostMessageListener(sdk, options.timeout, oauthParams.state);
      var iframeEl = loadFrame(requestUrl);
      return iframePromise
        .then(function(res) {
          return handleOAuthResponse(sdk, oauthParams, res);
        })
        .fin(function() {
          if (document.body.contains(iframeEl)) {
            iframeEl.parentElement.removeChild(iframeEl);
          }
        });

    case 'POPUP': // eslint-disable-line no-case-declarations
      var popupPromise;

      // Add listener on postMessage before window creation, so
      // postMessage isn't triggered before we're listening
      if (oauthParams.responseMode === 'okta_post_message') {
        if (!sdk.features.isPopupPostMessageSupported()) {
          return Q.reject(new AuthSdkError('This browser doesn\'t have full postMessage support'));
        }
        popupPromise = addPostMessageListener(sdk, options.timeout, oauthParams.state);
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
      function hasClosed(win) { // eslint-disable-line no-inner-declarations
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
        .then(function(res) {
          return handleOAuthResponse(sdk, oauthParams, res);
        })
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

function getWithoutPrompt(sdk, oauthOptions, options) {
  var oauthParams = util.clone(oauthOptions) || {};
  util.extend(oauthParams, {
    prompt: 'none',
    responseMode: 'okta_post_message',
    display: null
  });
  return getToken(sdk, oauthParams, options);
}

function getWithPopup(sdk, oauthOptions, options) {
  var oauthParams = util.clone(oauthOptions) || {};
  util.extend(oauthParams, {
    display: 'popup'
  });
  return getToken(sdk, oauthParams, options);
}

function getWithRedirect(sdk, oauthOptions, options) {
  oauthOptions = util.clone(oauthOptions) || {};
  var oauthParams = getDefaultOAuthParams(sdk, oauthOptions);
  // If the user didn't specify a responseMode
  if (!oauthOptions.responseMode) {
    // And it's only an auth code request (responseType could be an array)
    var respType = oauthParams.responseType;
    if (respType.indexOf('code') !== -1 &&
        (util.isString(respType) || (Array.isArray(respType) && respType.length === 1))) {
        // Default the responseMode to query
        util.extend(oauthParams, {
          responseMode: 'query'
        });
    // Otherwise, default to fragment
    } else {
      util.extend(oauthParams, {
        responseMode: 'fragment'
      });
    }
  }
  
  var requestUrl = buildAuthorizeUrl(sdk, oauthParams);

  // Set session cookie to store the oauthParams
  cookies.setCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME, JSON.stringify({
    responseType: oauthParams.responseType,
    state: oauthParams.state,
    nonce: oauthParams.nonce,
    scopes: oauthParams.scopes
  }));

  sdk.token.getWithRedirect._setLocation(requestUrl);
}

function isToken(obj) {
  if (obj &&
      (obj.accessToken || obj.idToken) &&
      Array.isArray(obj.scopes)) {
    return true;
  }
  return false;
}

function refreshToken(sdk, token) {
  if (!isToken(token)) {
    return Q.reject(new AuthSdkError('Refresh must be passed a token with ' +
      'an array of scopes and an accessToken or idToken'));
  }

  var responseType;
  if (token.accessToken) {
    responseType = 'token';
  } else {
    responseType = 'id_token';
  }
  return sdk.token.getWithoutPrompt({
    responseType: responseType,
    scopes: token.scopes
  });
}

function parseFromUrl(sdk, url) {
  var hash = sdk.token.parseFromUrl._getLocationHash();
  if (url) {
    hash = url.substring(url.indexOf('#'));
  }

  var oauthParamsCookie = cookies.getCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  if (!hash || !oauthParamsCookie) {
    return Q.reject(new AuthSdkError('Unable to parse a token from the url'));
  }
  try {
    var oauthParams = JSON.parse(oauthParamsCookie);
    cookies.deleteCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  } catch(e) {
    return Q.reject(new AuthSdkError('Unable to parse the ' + 
      config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME + ' cookie: ' + e.message));
  }

  return Q.resolve(hashToObject(hash))
    .then(function(res) {
      return handleOAuthResponse(sdk, oauthParams, res);
    });
}

function getUserInfo(sdk, accessTokenObject) {
  if (!accessTokenObject ||
      (!isToken(accessTokenObject) && !accessTokenObject.accessToken)) {
    return Q.reject(new AuthSdkError('getUserInfo requires an access token object'));
  }
  return http.httpRequest(sdk, {
    url: sdk.options.url + '/oauth2/v1/userinfo',
    method: 'GET',
    dontSaveResponse: true,
    accessToken: accessTokenObject.accessToken
  })
  .fail(function(err) {
    if (err.xhr && (err.xhr.status === 401 || err.xhr.status === 403)) {
      var authenticateHeader = err.xhr.getResponseHeader('WWW-Authenticate');
      if (authenticateHeader) {
        var errorMatches = authenticateHeader.match(/error="(.*?)"/) || [];
        var errorDescriptionMatches = authenticateHeader.match(/error_description="(.*?)"/) || [];
        var error = errorMatches[1];
        var errorDescription = errorDescriptionMatches[1];
        if (error && errorDescription) {
          err = new OAuthError(error, errorDescription);
        }
      }
    }
    throw err;
  });
}

module.exports = {
  getToken: getToken,
  getWithoutPrompt: getWithoutPrompt,
  getWithPopup: getWithPopup,
  getWithRedirect: getWithRedirect,
  parseFromUrl: parseFromUrl,
  refreshIdToken: refreshIdToken,
  decodeToken: decodeToken,
  verifyIdToken: verifyIdToken,
  refreshToken: refreshToken,
  getUserInfo: getUserInfo
};
