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
/* global window, document, btoa */
/* eslint-disable complexity, max-statements */
var http          = require('./http');
var util          = require('./util');
var oauthUtil     = require('./oauthUtil');
var sdkCrypto     = require('./crypto');
var AuthSdkError  = require('./errors/AuthSdkError');
var OAuthError    = require('./errors/OAuthError');
var constants     = require('./constants');
var cookies       = require('./browser/browserStorage').storage;
var PKCE          = require('./pkce');

// Only the access token can be revoked in SPA applications
function revokeToken(sdk, token) {
  return Promise.resolve()
  .then(function() {
    if (!token || !token.accessToken) {
      throw new AuthSdkError('A valid access token object is required');
    }
    var clientId = sdk.options.clientId;
    if (!clientId) {
      throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to revoke a token');
    }
    var revokeUrl = oauthUtil.getOAuthUrls(sdk).revokeUrl;
    var accessToken = token.accessToken;
    var args = util.toQueryParams({
      // eslint-disable-next-line camelcase
      token_type_hint: 'access_token',
      token: accessToken
    }).slice(1);
    var creds = btoa(clientId);
    return http.post(sdk, revokeUrl, args, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + creds
      }
    });
  });
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

// Verify the id token
function verifyToken(sdk, token, validationParams) {
  return Promise.resolve()
  .then(function() {
    if (!token || !token.idToken) {
      throw new AuthSdkError('Only idTokens may be verified');
    }

    var jwt = decodeToken(token.idToken);

    var validationOptions = {
      clientId: sdk.options.clientId,
      issuer: sdk.options.issuer,
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
      if (validationParams && validationParams.accessToken && token.claims.at_hash) {
        return sdkCrypto.getOidcHash(validationParams.accessToken)
          .then(hash => {
            if (hash !== token.claims.at_hash) {
              throw new AuthSdkError('Token hash verification failed');
            }
          });
      }
    })
    .then(() => {
      return token;
    });
  });
}

function addPostMessageListener(sdk, timeout, state) {
  var responseHandler;
  var timeoutId;
  var msgReceivedOrTimeout = new Promise(function(resolve, reject) {

    responseHandler = function responseHandler(e) {
      if (!e.data || e.data.state !== state) {
        // A message not meant for us
        return;
      }

      // Configuration mismatch between saved token and current app instance
      // This may happen if apps with different issuers are running on the same host url
      // If they share the same storage key, they may read and write tokens in the same location.
      // Common when developing against http://localhost
      if (e.origin !== sdk.getIssuerOrigin()) {
        return reject(new AuthSdkError('The request does not match client configuration'));
      }
      resolve(e.data);
    };

    oauthUtil.addListener(window, 'message', responseHandler);

    timeoutId = setTimeout(function() {
      reject(new AuthSdkError('OAuth flow timed out'));
    }, timeout || 120000);
  });

  return msgReceivedOrTimeout
    .finally(function() {
      clearTimeout(timeoutId);
      oauthUtil.removeListener(window, 'message', responseHandler);
    });
}

function addFragmentListener(sdk, windowEl, timeout) {
  var timeoutId;
  var promise = new Promise(function(resolve, reject) {
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
          resolve(oauthUtil.hashToObject(windowEl.location.hash));
        } else if (windowEl && !windowEl.closed) {
          setTimeout(hashChangeHandler, 500);
        }
      } catch (err) {
        setTimeout(hashChangeHandler, 500);
      }
    }
  
    hashChangeHandler();

    timeoutId = setTimeout(function() {
      reject(new AuthSdkError('OAuth flow timed out'));
    }, timeout || 120000);
  });

  return promise.finally(function() {
    clearTimeout(timeoutId);
  });
}

function exchangeCodeForToken(sdk, oauthParams, authorizationCode, urls) {
  // PKCE authorization_code flow
  // Retrieve saved values and build oauthParams for call to /token
  var meta = PKCE.loadMeta(sdk);
  var getTokenParams = {
    clientId: oauthParams.clientId,
    authorizationCode: authorizationCode,
    codeVerifier: meta.codeVerifier,
    redirectUri: meta.redirectUri
  };
  return PKCE.getToken(sdk, getTokenParams, urls)
  .then(function(res) {
    validateResponse(res, getTokenParams);
    return res;
  })
  .finally(function() {
    PKCE.clearMeta(sdk);
  });
}

function validateResponse(res, oauthParams) {
  if (res['error'] || res['error_description']) {
    throw new OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
  }
}

function handleOAuthResponse(sdk, oauthParams, res, urls) {
  urls = urls || {};

  var responseType = oauthParams.responseType;
  if (!Array.isArray(responseType)) {
    responseType = [responseType];
  }

  var scopes = util.clone(oauthParams.scopes);
  var clientId = oauthParams.clientId || sdk.options.clientId;
  var pkce = sdk.options.pkce !== false;

  return Promise.resolve()
  .then(function() {
    validateResponse(res, oauthParams);

    // PKCE flow
    // We do not support "hybrid" scenarios where the response includes both a code and a token.
    // If the response contains a code it is used immediately to obtain new tokens.
    if (res.code && pkce) {
      // responseType is not sent to the token endpoint.
      // We populate this array to validate the response below
      responseType = ['token']; // an accessToken will always be returned
      if (scopes.indexOf('openid') !== -1) {
        responseType.push('id_token'); // an idToken will be returned if "openid" is in the scopes
      }
      return exchangeCodeForToken(sdk, oauthParams, res.code, urls);
    }
    return res;
  }).then(function(res) {
    var tokenDict = {};
    var expiresIn = res.expires_in;
    var tokenType = res.token_type;
    var accessToken = res.access_token;
    var idToken = res.id_token;
    
    if (accessToken) {
      tokenDict.accessToken = {
        value: accessToken,
        accessToken: accessToken,
        expiresAt: Number(expiresIn) + Math.floor(Date.now()/1000),
        tokenType: tokenType,
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        userinfoUrl: urls.userinfoUrl
      };
    }

    if (idToken) {
      var jwt = sdk.token.decode(idToken);

      var idTokenObj = {
        value: idToken,
        idToken: idToken,
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
        accessToken: accessToken
      };

      if (oauthParams.ignoreSignature !== undefined) {
        validationParams.ignoreSignature = oauthParams.ignoreSignature;
      }

      return verifyToken(sdk, idTokenObj, validationParams)
      .then(function() {
        tokenDict.idToken = idTokenObj;
        return tokenDict;
      });
    }

    return tokenDict;
  })
  .then(function(tokenDict) {
    // Validate received tokens against requested response types 
    if (responseType.indexOf('token') !== -1 && !tokenDict.accessToken) {
      // eslint-disable-next-line max-len
      throw new AuthSdkError('Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.');
    }
    if (responseType.indexOf('id_token') !== -1 && !tokenDict.idToken) {
      // eslint-disable-next-line max-len
      throw new AuthSdkError('Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.');
    }

    return {
      tokens: tokenDict,
      state: res.state,
      code: res.code
    };
  });
}

function getDefaultOAuthParams(sdk) {
  return {
    pkce: sdk.options.pkce,
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    responseType: ['token', 'id_token'],
    responseMode: sdk.options.responseMode,
    state: oauthUtil.generateState(),
    nonce: oauthUtil.generateNonce(),
    scopes: ['openid', 'email'],
    ignoreSignature: sdk.options.ignoreSignature
  };
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
    'code_challenge': oauthParams.codeChallenge,
    'code_challenge_method': oauthParams.codeChallengeMethod,
    'display': oauthParams.display,
    'idp': oauthParams.idp,
    'idp_scope': oauthParams.idpScope,
    'login_hint': oauthParams.loginHint,
    'max_age': oauthParams.maxAge,
    'nonce': oauthParams.nonce,
    'prompt': oauthParams.prompt,
    'redirect_uri': oauthParams.redirectUri,
    'response_mode': oauthParams.responseMode,
    'response_type': oauthParams.responseType,
    'sessionToken': oauthParams.sessionToken,
    'state': oauthParams.state,
  });

  ['idp_scope', 'response_type'].forEach( function( mayBeArray ) { 
    if (Array.isArray(oauthQueryParams[mayBeArray])) {
      oauthQueryParams[mayBeArray] = oauthQueryParams[mayBeArray].join(' ');
    }
  });

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
function getToken(sdk, options) {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getToken" takes only a single set of options'));
  }
  
  options = options || {};

  return prepareOauthParams(sdk, options)
  .then(function(oauthParams) {

    // Start overriding any options that don't make sense
    var sessionTokenOverrides = {
      prompt: 'none',
      responseMode: 'okta_post_message',
      display: null
    };

    var idpOverrides = {
      display: 'popup'
    };

    if (options.sessionToken) {
      util.extend(oauthParams, sessionTokenOverrides);
    } else if (options.idp) {
      util.extend(oauthParams, idpOverrides);
    }

    // Use the query params to build the authorize url
    var requestUrl,
        endpoint,
        urls;

    // Get authorizeUrl and issuer
    urls = oauthUtil.getOAuthUrls(sdk, oauthParams);
    endpoint = options.codeVerifier ? urls.tokenUrl : urls.authorizeUrl;
    requestUrl = endpoint + buildAuthorizeParams(oauthParams);

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
      /* eslint-disable-next-line no-useless-escape */
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
          .finally(function() {
            if (document.body.contains(iframeEl)) {
              iframeEl.parentElement.removeChild(iframeEl);
            }
          });

      case 'POPUP':
        var oauthPromise; // resolves with OAuth response

        // Add listener on postMessage before window creation, so
        // postMessage isn't triggered before we're listening
        if (oauthParams.responseMode === 'okta_post_message') {
          if (!sdk.features.isPopupPostMessageSupported()) {
            throw new AuthSdkError('This browser doesn\'t have full postMessage support');
          }
          oauthPromise = addPostMessageListener(sdk, options.timeout, oauthParams.state);
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
            throw new AuthSdkError('Using fragment, the redirectUri origin (' + redirectUriOrigin +
              ') must match the origin of this page (' + windowOrigin + ')');
          }
          oauthPromise = addFragmentListener(sdk, windowEl, options.timeout);
        }

        // The popup may be closed without receiving an OAuth response. Setup a poller to monitor the window.
        var popupPromise = new Promise(function(resolve, reject) {
          var closePoller = setInterval(function() {
            if (!windowEl || windowEl.closed) {
              clearInterval(closePoller);
              reject(new AuthSdkError('Unable to parse OAuth flow response'));
            }
          }, 100);

          // Proxy the OAuth promise results
          oauthPromise
          .then(function(res) {
            clearInterval(closePoller);
            resolve(res);
          })
          .catch(function(err) {
            clearInterval(closePoller);
            reject(err);
          });
        });

        return popupPromise
          .then(function(res) {
            return handleOAuthResponse(sdk, oauthParams, res, urls);
          })
          .finally(function() {
            if (windowEl && !windowEl.closed) {
              windowEl.close();
            }
          });

      default:
        throw new AuthSdkError('The full page redirect flow is not supported');
    }
  });
}

function getWithoutPrompt(sdk, options) {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithoutPrompt" takes only a single set of options'));
  }
  options = util.clone(options) || {};
  util.extend(options, {
    prompt: 'none',
    responseMode: 'okta_post_message',
    display: null
  });
  return getToken(sdk, options);
}

function getWithPopup(sdk, options) {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithPopup" takes only a single set of options'));
  }
  options = util.clone(options) || {};
  util.extend(options, {
    display: 'popup',
    responseMode: 'okta_post_message'
  });
  return getToken(sdk, options);
}

function prepareOauthParams(sdk, options) {
  // clone and prepare options
  options = util.clone(options) || {};

  // build params using defaults + options
  var oauthParams = getDefaultOAuthParams(sdk);
  util.extend(oauthParams, options);

  if (oauthParams.pkce === false) {
    return Promise.resolve(oauthParams);
  }

  // PKCE flow
  if (!sdk.features.isPKCESupported()) {
    var errorMessage = 'PKCE requires a modern browser with encryption support running in a secure context.';
    if (!sdk.features.isHTTPS()) {
      // eslint-disable-next-line max-len
      errorMessage += '\nThe current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.';
    }
    if (!sdk.features.hasTextEncoder()) {
      // eslint-disable-next-line max-len
      errorMessage += '\n"TextEncoder" is not defined. To use PKCE, you may need to include a polyfill/shim for this browser.';
    }
    return Promise.reject(new AuthSdkError(errorMessage));
  }

  // set default code challenge method, if none provided
  if (!oauthParams.codeChallengeMethod) {
    oauthParams.codeChallengeMethod = PKCE.DEFAULT_CODE_CHALLENGE_METHOD;
  }

  // responseType is forced
  oauthParams.responseType = 'code';

  return oauthUtil.getWellKnown(sdk, null)
    .then(function(res) {
      var methods = res['code_challenge_methods_supported'] || [];
      if (methods.indexOf(oauthParams.codeChallengeMethod) === -1) {
        throw new AuthSdkError('Invalid code_challenge_method');
      }
    })
    .then(function() {
      // PKCE authorization_code flow
      var codeVerifier = PKCE.generateVerifier(oauthParams.codeVerifier);

      // We will need these values after redirect when we call /token
      var meta = {
        codeVerifier: codeVerifier,
        redirectUri: oauthParams.redirectUri
      };
      PKCE.saveMeta(sdk, meta);

      return PKCE.computeChallenge(codeVerifier);
    })
    .then(function(codeChallenge) {

      // Clone/copy the params. Set codeChallenge
      var clonedParams = util.clone(oauthParams) || {};
      util.extend(clonedParams, oauthParams, {
        codeChallenge: codeChallenge,
      });
      return clonedParams;
    });
}

function getWithRedirect(sdk, options) {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithRedirect" takes only a single set of options'));
  }
  options = util.clone(options) || {};

  return prepareOauthParams(sdk, options)
    .then(function(oauthParams) {
      var urls = oauthUtil.getOAuthUrls(sdk, options);
      var requestUrl = urls.authorizeUrl + buildAuthorizeParams(oauthParams);

      // Set session cookie to store the oauthParams
      cookies.set(constants.REDIRECT_OAUTH_PARAMS_COOKIE_NAME, JSON.stringify({
        responseType: oauthParams.responseType,
        state: oauthParams.state,
        nonce: oauthParams.nonce,
        scopes: oauthParams.scopes,
        clientId: oauthParams.clientId,
        urls: urls,
        ignoreSignature: oauthParams.ignoreSignature
      }), null, sdk.options.cookies);

      // Set nonce cookie for servers to validate nonce in id_token
      cookies.set(constants.REDIRECT_NONCE_COOKIE_NAME, oauthParams.nonce, null, sdk.options.cookies);

      // Set state cookie for servers to validate state
      cookies.set(constants.REDIRECT_STATE_COOKIE_NAME, oauthParams.state, null, sdk.options.cookies);

      sdk.token.getWithRedirect._setLocation(requestUrl);
    });
}

function renewToken(sdk, token) {
  if (!oauthUtil.isToken(token)) {
    return Promise.reject(new AuthSdkError('Renew must be passed a token with ' +
      'an array of scopes and an accessToken or idToken'));
  }

  var responseType;
  if (sdk.options.pkce) {
    responseType = 'code';
  } else if (token.accessToken) {
    responseType = 'token';
  } else {
    responseType = 'id_token';
  }

  return getWithoutPrompt(sdk, {
    responseType: responseType,
    scopes: token.scopes,
    authorizeUrl: token.authorizeUrl,
    userinfoUrl: token.userinfoUrl,
    issuer: token.issuer
  })
  .then(function(res) {
    // Multiple tokens may have come back. Return only the token which was requested.
    var tokens = res.tokens;
    return token.idToken ? tokens.idToken : tokens.accessToken;
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

function removeSearch(sdk) {
  var nativeHistory = sdk.token.parseFromUrl._getHistory();
  var nativeDoc = sdk.token.parseFromUrl._getDocument();
  var nativeLoc = sdk.token.parseFromUrl._getLocation();
  if (nativeHistory && nativeHistory.replaceState) {
    nativeHistory.replaceState(null, nativeDoc.title, nativeLoc.pathname + nativeLoc.hash);
  } else {
    nativeLoc.search = '';
  }
}

function parseFromUrl(sdk, options) {
  options = options || {};
  if (util.isString(options)) {
    options = { url: options };
  }

  // https://openid.net/specs/openid-connect-core-1_0.html#Authentication
  var defaultResponseMode = sdk.options.pkce ? 'query' : 'fragment';

  var url = options.url;
  var responseMode = options.responseMode || sdk.options.responseMode || defaultResponseMode;
  var nativeLoc = sdk.token.parseFromUrl._getLocation();
  var paramStr;

  if (responseMode === 'query') {
    paramStr = url ? url.substring(url.indexOf('?')) : nativeLoc.search;
  } else {
    paramStr = url ? url.substring(url.indexOf('#')) : nativeLoc.hash;
  }

  if (!paramStr) {
    return Promise.reject(new AuthSdkError('Unable to parse a token from the url'));
  }

  var oauthParamsCookie = cookies.get(constants.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  if (!oauthParamsCookie) {
    return Promise.reject(new AuthSdkError('Unable to retrieve OAuth redirect params cookie'));
  }

  try {
    var oauthParams = JSON.parse(oauthParamsCookie);
    var urls = oauthParams.urls;
    delete oauthParams.urls;
    cookies.delete(constants.REDIRECT_OAUTH_PARAMS_COOKIE_NAME);
  } catch(e) {
    return Promise.reject(new AuthSdkError('Unable to parse the ' +
    constants.REDIRECT_OAUTH_PARAMS_COOKIE_NAME + ' cookie: ' + e.message));
  }

  return Promise.resolve(oauthUtil.urlParamsToObject(paramStr))
    .then(function(res) {
      if (!url) {
        // Clean hash or search from the url
        responseMode === 'query' ? removeSearch(sdk) : removeHash(sdk);
      }
      return handleOAuthResponse(sdk, oauthParams, res, urls);
    });
}

async function getUserInfo(sdk, accessTokenObject, idTokenObject) {
  // If token objects were not passed, attempt to read from the TokenManager
  if (!accessTokenObject) {
    accessTokenObject = await sdk.tokenManager.get('accessToken');
  }
  if (!idTokenObject) {
    idTokenObject = await sdk.tokenManager.get('idToken');
  }

  if (!accessTokenObject ||
      (!oauthUtil.isToken(accessTokenObject) && !accessTokenObject.accessToken && !accessTokenObject.userinfoUrl)) {
    return Promise.reject(new AuthSdkError('getUserInfo requires an access token object'));
  }

  if (!idTokenObject ||
    (!oauthUtil.isToken(idTokenObject) && !idTokenObject.idToken)) {
    return Promise.reject(new AuthSdkError('getUserInfo requires an ID token object'));
  }

  return http.httpRequest(sdk, {
    url: accessTokenObject.userinfoUrl,
    method: 'GET',
    accessToken: accessTokenObject.accessToken
  })
  .then(userInfo => {
    // Only return the userinfo response if subjects match to mitigate token substitution attacks
    if (userInfo.sub === idTokenObject.claims.sub) {
      return userInfo;
    }
    return Promise.reject(new AuthSdkError('getUserInfo request was rejected due to token mismatch'));
  })
  .catch(function(err) {
    if (err.xhr && (err.xhr.status === 401 || err.xhr.status === 403)) {
      var authenticateHeader;
      if (err.xhr.headers && util.isFunction(err.xhr.headers.get) && err.xhr.headers.get('WWW-Authenticate')) {
        authenticateHeader = err.xhr.headers.get('WWW-Authenticate');
      } else if (util.isFunction(err.xhr.getResponseHeader)) {
        authenticateHeader = err.xhr.getResponseHeader('WWW-Authenticate');
      }
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
  revokeToken: revokeToken,
  getToken: getToken,
  getWithoutPrompt: getWithoutPrompt,
  getWithPopup: getWithPopup,
  getWithRedirect: getWithRedirect,
  parseFromUrl: parseFromUrl,
  decodeToken: decodeToken,
  renewToken: renewToken,
  getUserInfo: getUserInfo,
  verifyToken: verifyToken,
  handleOAuthResponse: handleOAuthResponse,
  prepareOauthParams: prepareOauthParams
};
