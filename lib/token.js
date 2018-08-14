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
 *
 */

/* eslint-disable complexity, max-statements */
var http          = require('./http');
var util          = require('./util');
var oauthUtil     = require('./oauthUtil');
var Q             = require('q');
var sdkCrypto     = require('./crypto');
var AuthSdkError  = require('./errors/AuthSdkError');
var OAuthError    = require('./errors/OAuthError');
var config        = require('./config');
var cookies       = require('./cookies');

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

function verifyToken(sdk, token, validationParams) {
  return new Q()
  .then(function() {
    if (!token || !token.idToken) {
      throw new AuthSdkError('Only idTokens may be verified');
    }

    var jwt = decodeToken(token.idToken);

    var validationOptions = {
      clientId: sdk.options.clientId,
      issuer: sdk.options.issuer || sdk.options.url,
      ignoreSignature: sdk.options.ignoreSignature
    };

    util.extend(validationOptions, validationParams);

    // Standard claim validation
    oauthUtil.validateClaims(sdk, jwt.payload, validationOptions);

    // If the browser doesn't support native crypto or we choose not
    // to verify the signature, bail early
    if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
      return token;
    }

    return oauthUtil.getKey(sdk, token.issuer, jwt.header.kid)
    .then(function(key) {
      return sdkCrypto.verifyToken(token.idToken, key);
    })
    .then(function(valid) {
      if (!valid) {
        throw new AuthSdkError('The token signature is not valid');
      }
      return token;
    });
  });
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

  oauthUtil.addListener(window, 'message', responseHandler);

  return deferred.promise.timeout(timeout || 120000, new AuthSdkError('OAuth flow timed out'))
    .fin(function() {
      oauthUtil.removeListener(window, 'message', responseHandler);
    });
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
        deferred.resolve(oauthUtil.hashToObject(windowEl.location.hash));
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

function handleOAuthResponse(sdk, oauthParams, res, urls) {
  urls = urls || {};

  var tokenTypes = oauthParams.responseType;
  var scopes = util.clone(oauthParams.scopes);
  var clientId = oauthParams.clientId || sdk.options.clientId;

  return new Q()
  .then(function() {
    if (res['error'] || res['error_description']) {
      throw new OAuthError(res['error'], res['error_description']);
    }

    if (res.state !== oauthParams.state) {
      throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
    }

    var tokenDict = {};

    if (res['access_token']) {
      tokenDict['token'] = {
        accessToken: res['access_token'],
        expiresAt: Number(res['expires_in']) + Math.floor(Date.now()/1000),
        tokenType: res['token_type'],
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        userinfoUrl: urls.userinfoUrl
      };
    }

    if (res['code']) {
      tokenDict['code'] = {
        authorizationCode: res['code']
      };
    }

    if (res['id_token']) {
      var jwt = sdk.token.decode(res['id_token']);

      var idToken = {
        idToken: res['id_token'],
        claims: jwt.payload,
        expiresAt: jwt.payload.exp,
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        issuer: urls.issuer,
        clientId: clientId
      };

      var validationParams = {
        clientId: clientId,
        issuer: urls.issuer,
        nonce: oauthParams.nonce,
        ignoreSignature: oauthParams.ignoreSignature
      };

      return verifyToken(sdk, idToken, validationParams)
      .then(function() {
        tokenDict['id_token'] = idToken;
        return tokenDict;
      });
    }

    return tokenDict;
  })
  .then(function(tokenDict) {
    if (!Array.isArray(tokenTypes)) {
      return tokenDict[tokenTypes];
    }

    if (!tokenDict['token'] && !tokenDict['id_token']) {
      throw new AuthSdkError('Unable to parse OAuth flow response');
    }

    // Create token array in the order of the responseType array
    return tokenTypes.map(function(item) {
      return tokenDict[item];
    });
  });
}

function getDefaultOAuthParams(sdk, oauthOptions) {
  oauthOptions = util.clone(oauthOptions) || {};

  var defaults = {
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    responseType: 'id_token',
    responseMode: 'okta_post_message',
    state: util.genRandomString(64),
    nonce: util.genRandomString(64),
    scopes: ['openid', 'email'],
    ignoreSignature: sdk.options.ignoreSignature
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

function buildAuthorizeParams(oauthParams) {
  var oauthQueryParams = convertOAuthParamsToQueryParams(oauthParams);
  return util.toQueryParams(oauthQueryParams);
}

/*
 * Retrieve an idToken from an Okta or a third party idp
 *
 * Two main flows:
 *
 *  1) Exchange a sessionToken for a token
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
 *  2) Get a token from an idp
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
  oauthOptions = oauthOptions || {};
  options = options || {};

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
  var requestUrl,
      urls;
  try {
    // Get authorizeUrl and issuer
    urls = oauthUtil.getOAuthUrls(sdk, oauthParams, options);
    requestUrl = urls.authorizeUrl + buildAuthorizeParams(oauthParams);
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
      var iframeEl = oauthUtil.loadFrame(requestUrl);
      return iframePromise
        .then(function(res) {
          return handleOAuthResponse(sdk, oauthParams, res, urls);
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
      var windowEl = oauthUtil.loadPopup(requestUrl, windowOptions);

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
          return handleOAuthResponse(sdk, oauthParams, res, urls);
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

  var urls = oauthUtil.getOAuthUrls(sdk, oauthParams, options);
  var requestUrl = urls.authorizeUrl + buildAuthorizeParams(oauthParams);

  // Set session cookie to store the oauthParams
  cookies.setCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME, JSON.stringify({
    responseType: oauthParams.responseType,
    state: oauthParams.state,
    nonce: oauthParams.nonce,
    scopes: oauthParams.scopes,
    clientId: oauthParams.clientId,
    urls: urls
  }));

  // Set nonce cookie for servers to validate nonce in id_token
  cookies.setCookie(config.REDIRECT_NONCE_COOKIE_NAME, oauthParams.nonce);

  // Set state cookie for servers to validate state
  cookies.setCookie(config.REDIRECT_STATE_COOKIE_NAME, oauthParams.state);

  sdk.token.getWithRedirect._setLocation(requestUrl);
}

function renewToken(sdk, token) {
  if (!oauthUtil.isToken(token)) {
    return Q.reject(new AuthSdkError('Renew must be passed a token with ' +
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
  }, {
    authorizeUrl: token.authorizeUrl,
    userinfoUrl: token.userinfoUrl,
    issuer: token.issuer
  });
}

function removeHash(sdk) {
  var nativeHistory = sdk.token.parseFromUrl._getHistory();
  var nativeDoc = sdk.token.parseFromUrl._getDocument();
  var nativeLoc = sdk.token.parseFromUrl._getLocation();
  if (nativeHistory && nativeHistory.replaceState) {
    nativeHistory.replaceState(null, nativeDoc.title, nativeLoc.pathname + nativeLoc.search);
  } else {
    nativeLoc.hash = '';
  }
}

function parseFromUrl(sdk, url) {
  var nativeLoc = sdk.token.parseFromUrl._getLocation();
  var hash = nativeLoc.hash;
  if (url) {
    hash = url.substring(url.indexOf('#'));
  }

  if (!hash) {
    return Q.reject(new AuthSdkError('Unable to parse a token from the url'));
  }

  var oauthParamsCookie = cookies.getCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  if (!oauthParamsCookie) {
    return Q.reject(new AuthSdkError('Unable to retrieve OAuth redirect params cookie'));
  }

  try {
    var oauthParams = JSON.parse(oauthParamsCookie);
    var urls = oauthParams.urls;
    delete oauthParams.urls;
    cookies.deleteCookie(config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  } catch(e) {
    return Q.reject(new AuthSdkError('Unable to parse the ' +
      config.REDIRECT_OAUTH_PARAMS_COOKIE_NAME + ' cookie: ' + e.message));
  }

  return Q.resolve(oauthUtil.hashToObject(hash))
    .then(function(res) {
      if (!url) {
        // Remove the hash from the url
        removeHash(sdk);
      }
      return handleOAuthResponse(sdk, oauthParams, res, urls);
    });
}

function getUserInfo(sdk, accessTokenObject) {
  if (!accessTokenObject ||
      (!oauthUtil.isToken(accessTokenObject) && !accessTokenObject.accessToken && !accessTokenObject.userinfoUrl)) {
    return Q.reject(new AuthSdkError('getUserInfo requires an access token object'));
  }
  return http.httpRequest(sdk, {
    url: accessTokenObject.userinfoUrl,
    method: 'GET',
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
  decodeToken: decodeToken,
  renewToken: renewToken,
  getUserInfo: getUserInfo,
  verifyToken: verifyToken
};
