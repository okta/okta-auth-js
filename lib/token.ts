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
import http from './http';
import { toQueryParams, base64UrlToString, clone, isString, removeNils, isFunction } from './util';
import {
  getOAuthUrls,
  validateClaims,
  getKey,
  addListener,
  removeListener,
  urlParamsToObject,
  generateState,
  generateNonce,
  loadFrame,
  loadPopup,
  getWellKnown,
  isLoginRedirect
} from './oauthUtil';
import * as sdkCrypto from './crypto';
import AuthSdkError from './errors/AuthSdkError';
import OAuthError from './errors/OAuthError';
import {
  REDIRECT_OAUTH_PARAMS_NAME,
  REDIRECT_NONCE_COOKIE_NAME,
  REDIRECT_STATE_COOKIE_NAME
} from './constants';
import browserStorage from './browser/browserStorage';
import PKCE from './pkce';

import {
  OktaAuth,
  Token,
  isToken,
  isAccessToken,
  isIDToken,
  TokenVerifyParams,
  AccessToken,
  IDToken,
  JWTObject,
  UserClaims,
  OAuthParams,
  OAuthResponse,
  TokenParams,
  TokenResponse,
  CustomUrls,
  PKCEMeta,
  ParseFromUrlOptions,
  Tokens
} from './types';

const cookies = browserStorage.storage;

// Only the access token can be revoked in SPA applications
function revokeToken(sdk: OktaAuth, token: AccessToken): Promise<any> {
  return Promise.resolve()
  .then(function() {
    if (!token || !token.accessToken) {
      throw new AuthSdkError('A valid access token object is required');
    }
    var clientId = sdk.options.clientId;
    if (!clientId) {
      throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to revoke a token');
    }
    var revokeUrl = getOAuthUrls(sdk).revokeUrl;
    var accessToken = token.accessToken;
    var args = toQueryParams({
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

function decodeToken(token: string): JWTObject {
  var jwt = token.split('.');
  var decodedToken: JWTObject;

  try {
    decodedToken = {
      header: JSON.parse(base64UrlToString(jwt[0])),
      payload: JSON.parse(base64UrlToString(jwt[1])),
      signature: jwt[2]
    };
  } catch(e) {
    throw new AuthSdkError('Malformed token');
  }

  return decodedToken;
}

// Verify the id token
function verifyToken(sdk: OktaAuth, token: IDToken, validationParams: TokenVerifyParams): Promise<IDToken> {
  return Promise.resolve()
  .then(function() {
    if (!token || !token.idToken) {
      throw new AuthSdkError('Only idTokens may be verified');
    }

    var jwt = decodeToken(token.idToken);

    var validationOptions: TokenVerifyParams = {
      clientId: sdk.options.clientId,
      issuer: sdk.options.issuer,
      ignoreSignature: sdk.options.ignoreSignature
    };

    Object.assign(validationOptions, validationParams);

    // Standard claim validation
    validateClaims(sdk, jwt.payload, validationOptions);

    // If the browser doesn't support native crypto or we choose not
    // to verify the signature, bail early
    if (validationOptions.ignoreSignature == true || !sdk.features.isTokenVerifySupported()) {
      return token;
    }

    return getKey(sdk, token.issuer, jwt.header.kid)
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

function addPostMessageListener(sdk: OktaAuth, timeout, state) {
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

    addListener(window, 'message', responseHandler);

    timeoutId = setTimeout(function() {
      reject(new AuthSdkError('OAuth flow timed out'));
    }, timeout || 120000);
  });

  return msgReceivedOrTimeout
    .finally(function() {
      clearTimeout(timeoutId);
      removeListener(window, 'message', responseHandler);
    });
}

function exchangeCodeForToken(sdk: OktaAuth, oauthParams: TokenParams, authorizationCode: string, urls: CustomUrls) {
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

function validateResponse(res: OAuthResponse, oauthParams: TokenParams) {
  if (res['error'] || res['error_description']) {
    throw new OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new AuthSdkError('OAuth flow response state doesn\'t match request state');
  }
}

// eslint-disable-next-line max-len
function handleOAuthResponse(sdk: OktaAuth, tokenParams: TokenParams, res: OAuthResponse, urls: CustomUrls): Promise<TokenResponse> {
  urls = urls || {};

  var responseType = tokenParams.responseType;
  if (!Array.isArray(responseType)) {
    responseType = [responseType];
  }

  var scopes = clone(tokenParams.scopes);
  var clientId = tokenParams.clientId || sdk.options.clientId;
  var pkce = sdk.options.pkce !== false;

  return Promise.resolve()
  .then(function() {
    validateResponse(res, tokenParams);

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
      return exchangeCodeForToken(sdk, tokenParams, res.code, urls);
    }
    return res;
  }).then(function(res: OAuthResponse) {
    var tokenDict = {} as Tokens;
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

      var idTokenObj: IDToken = {
        value: idToken,
        idToken: idToken,
        claims: jwt.payload,
        expiresAt: jwt.payload.exp,
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        issuer: urls.issuer,
        clientId: clientId
      };

      var validationParams: TokenVerifyParams = {
        clientId: clientId,
        issuer: urls.issuer,
        nonce: tokenParams.nonce,
        accessToken: accessToken
      };

      if (tokenParams.ignoreSignature !== undefined) {
        validationParams.ignoreSignature = tokenParams.ignoreSignature;
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

function getDefaultTokenParams(sdk: OktaAuth): TokenParams {
  return {
    pkce: sdk.options.pkce,
    clientId: sdk.options.clientId,
    redirectUri: sdk.options.redirectUri || window.location.href,
    responseType: ['token', 'id_token'],
    responseMode: sdk.options.responseMode,
    state: generateState(),
    nonce: generateNonce(),
    scopes: ['openid', 'email'],
    ignoreSignature: sdk.options.ignoreSignature
  };
}

function convertTokenParamsToOAuthParams(tokenParams: TokenParams) {
  // Quick validation
  if (!tokenParams.clientId) {
    throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token');
  }

  if (isString(tokenParams.responseType) && tokenParams.responseType.indexOf(' ') !== -1) {
    throw new AuthSdkError('Multiple OAuth responseTypes must be defined as an array');
  }

  // Convert our params to their actual OAuth equivalents
  var oauthParams: OAuthParams = {
    'client_id': tokenParams.clientId,
    'code_challenge': tokenParams.codeChallenge,
    'code_challenge_method': tokenParams.codeChallengeMethod,
    'display': tokenParams.display,
    'idp': tokenParams.idp,
    'idp_scope': tokenParams.idpScope,
    'login_hint': tokenParams.loginHint,
    'max_age': tokenParams.maxAge,
    'nonce': tokenParams.nonce,
    'prompt': tokenParams.prompt,
    'redirect_uri': tokenParams.redirectUri,
    'response_mode': tokenParams.responseMode,
    'response_type': tokenParams.responseType,
    'sessionToken': tokenParams.sessionToken,
    'state': tokenParams.state,
  };
  oauthParams = removeNils(oauthParams) as OAuthParams;

  ['idp_scope', 'response_type'].forEach( function( mayBeArray ) { 
    if (Array.isArray(oauthParams[mayBeArray])) {
      oauthParams[mayBeArray] = oauthParams[mayBeArray].join(' ');
    }
  });

  if (tokenParams.responseType.indexOf('id_token') !== -1 &&
    tokenParams.scopes.indexOf('openid') === -1) {
    throw new AuthSdkError('openid scope must be specified in the scopes argument when requesting an id_token');
  } else {
    oauthParams.scope = tokenParams.scopes.join(' ');
  }

  return oauthParams;
}

function buildAuthorizeParams(tokenParams: TokenParams) {
  var oauthQueryParams = convertTokenParamsToOAuthParams(tokenParams);
  return toQueryParams(oauthQueryParams);
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
function getToken(sdk: OktaAuth, options: TokenParams) {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getToken" takes only a single set of options'));
  }
  
  options = options || {};

  return prepareTokenParams(sdk, options)
  .then(function(tokenParams: TokenParams) {

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
      Object.assign(tokenParams, sessionTokenOverrides);
    } else if (options.idp) {
      Object.assign(tokenParams, idpOverrides);
    }

    // Use the query params to build the authorize url
    var requestUrl,
        endpoint,
        urls;

    // Get authorizeUrl and issuer
    urls = getOAuthUrls(sdk, tokenParams);
    endpoint = options.codeVerifier ? urls.tokenUrl : urls.authorizeUrl;
    requestUrl = endpoint + buildAuthorizeParams(tokenParams);

    // Determine the flow type
    var flowType;
    if (tokenParams.sessionToken || tokenParams.display === null) {
      flowType = 'IFRAME';
    } else if (tokenParams.display === 'popup') {
      flowType = 'POPUP';
    } else {
      flowType = 'IMPLICIT';
    }

    // Execute the flow type
    switch (flowType) {
      case 'IFRAME':
        var iframePromise = addPostMessageListener(sdk, options.timeout, tokenParams.state);
        var iframeEl = loadFrame(requestUrl);
        return iframePromise
          .then(function(res) {
            return handleOAuthResponse(sdk, tokenParams, res, urls);
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
        if (tokenParams.responseMode === 'okta_post_message') {
          if (!sdk.features.isPopupPostMessageSupported()) {
            throw new AuthSdkError('This browser doesn\'t have full postMessage support');
          }
          oauthPromise = addPostMessageListener(sdk, options.timeout, tokenParams.state);
        }

        // Create the window
        var windowOptions = {
          popupTitle: options.popupTitle
        };
        var windowEl = loadPopup(requestUrl, windowOptions);

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
            return handleOAuthResponse(sdk, tokenParams, res, urls);
          })
          .finally(function() {
            if (windowEl && !windowEl.closed) {
              windowEl.close();
            }
          });

      default:
        throw new AuthSdkError('The full page redirect flow is not supported');
    }
  })
  .catch(e => {
    if (sdk.options.pkce) {
      PKCE.clearMeta(sdk);
    }
    throw e;
  });
}

function getWithoutPrompt(sdk: OktaAuth, options: TokenParams): Promise<TokenResponse> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithoutPrompt" takes only a single set of options'));
  }
  options = clone(options) || {};
  Object.assign(options, {
    prompt: 'none',
    responseMode: 'okta_post_message',
    display: null
  });
  return getToken(sdk, options);
}

function getWithPopup(sdk: OktaAuth, options: TokenParams): Promise<TokenResponse> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithPopup" takes only a single set of options'));
  }
  options = clone(options) || {};
  Object.assign(options, {
    display: 'popup',
    responseMode: 'okta_post_message'
  });
  return getToken(sdk, options);
}

function prepareTokenParams(sdk: OktaAuth, options: TokenParams): Promise<TokenParams> {
  if (isLoginRedirect(sdk)) {
    return Promise.reject(new AuthSdkError(
      'The app should not attempt to call getToken on callback. ' +
      'Authorize flow is already in process. Use parseFromUrl() to receive tokens.'
    ));
  }

  // clone and prepare options
  options = clone(options) || {};

  // build params using defaults + options
  var tokenParams: TokenParams = getDefaultTokenParams(sdk);
  Object.assign(tokenParams, options);

  if (tokenParams.pkce === false) {
    return Promise.resolve(tokenParams);
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
  if (!tokenParams.codeChallengeMethod) {
    tokenParams.codeChallengeMethod = PKCE.DEFAULT_CODE_CHALLENGE_METHOD;
  }

  // responseType is forced
  tokenParams.responseType = 'code';

  return getWellKnown(sdk, null)
    .then(function(res) {
      var methods = res['code_challenge_methods_supported'] || [];
      if (methods.indexOf(tokenParams.codeChallengeMethod) === -1) {
        throw new AuthSdkError('Invalid code_challenge_method');
      }
    })
    .then(function() {
      // PKCE authorization_code flow
      var codeVerifier = PKCE.generateVerifier(tokenParams.codeVerifier);

      // We will need these values after redirect when we call /token
      var meta: PKCEMeta = {
        codeVerifier: codeVerifier,
        redirectUri: tokenParams.redirectUri
      };
      PKCE.saveMeta(sdk, meta);

      return PKCE.computeChallenge(codeVerifier);
    })
    .then(function(codeChallenge) {

      // Clone/copy the params. Set codeChallenge
      var clonedParams = clone(tokenParams) || {};
      Object.assign(clonedParams, tokenParams, {
        codeChallenge: codeChallenge,
      });
      return clonedParams;
    });
}

function addOAuthParamsToStorage(sdk: OktaAuth, tokenParams: TokenParams, urls) {
  const { responseType, state, nonce, scopes, clientId, ignoreSignature } = tokenParams;
  const tokenParamsStr = JSON.stringify({
    responseType,
    state,
    nonce,
    scopes,
    clientId,
    urls,
    ignoreSignature
  });
  if (browserStorage.browserHasSessionStorage()) {
    browserStorage.getSessionStorage().setItem(REDIRECT_OAUTH_PARAMS_NAME, tokenParamsStr);
  } else {
    cookies.set(REDIRECT_OAUTH_PARAMS_NAME, tokenParamsStr, null, sdk.options.cookies);
  }
}

function getWithRedirect(sdk: OktaAuth, options: TokenParams): Promise<void> {
  if (arguments.length > 2) {
    return Promise.reject(new AuthSdkError('As of version 3.0, "getWithRedirect" takes only a single set of options'));
  }
  options = clone(options) || {};

  return prepareTokenParams(sdk, options)
    .then(function(tokenParams: TokenParams) {
      var urls = getOAuthUrls(sdk, options);
      var requestUrl = urls.authorizeUrl + buildAuthorizeParams(tokenParams);

      addOAuthParamsToStorage(sdk, tokenParams, urls);

      // Set nonce cookie for servers to validate nonce in id_token
      cookies.set(REDIRECT_NONCE_COOKIE_NAME, tokenParams.nonce, null, sdk.options.cookies);

      // Set state cookie for servers to validate state
      cookies.set(REDIRECT_STATE_COOKIE_NAME, tokenParams.state, null, sdk.options.cookies);

      sdk.token.getWithRedirect._setLocation(requestUrl);
    });
}

function renewToken(sdk: OktaAuth, token: Token): Promise<Token> {
  if (!isToken(token)) {
    return Promise.reject(new AuthSdkError('Renew must be passed a token with ' +
      'an array of scopes and an accessToken or idToken'));
  }

  var responseType;
  if (sdk.options.pkce) {
    responseType = 'code';
  } else if (isAccessToken(token)) {
    responseType = 'token';
  } else {
    responseType = 'id_token';
  }

  const { scopes, authorizeUrl, userinfoUrl, issuer } = token as (AccessToken & IDToken);
  return getWithoutPrompt(sdk, {
    responseType,
    scopes,
    authorizeUrl,
    userinfoUrl,
    issuer
  })
  .then(function(res) {
    // Multiple tokens may have come back. Return only the token which was requested.
    var tokens = res.tokens;
    return isIDToken(token) ? tokens.idToken : tokens.accessToken;
  });
}

function renewTokens(sdk: OktaAuth, options: TokenParams): Promise<Tokens> {
  options = Object.assign({
    scopes: sdk.options.scopes,
    authorizeUrl: sdk.options.authorizeUrl,
    userinfoUrl: sdk.options.userinfoUrl,
    issuer: sdk.options.issuer
  }, options);

  if (sdk.options.pkce) {
    options.responseType = 'code';
  } else {
    options.responseType = ['token', 'id_token'];
  }

  return getWithoutPrompt(sdk, options)
    .then(res => res.tokens);
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

function getOAuthParamsStrFromStorage() {
  let oauthParamsStr;
  if (browserStorage.browserHasSessionStorage()) {
    const storage = browserStorage.getSessionStorage();
    oauthParamsStr = storage.getItem(REDIRECT_OAUTH_PARAMS_NAME);
    storage.removeItem(REDIRECT_OAUTH_PARAMS_NAME);
  } else {
    oauthParamsStr = cookies.get(REDIRECT_OAUTH_PARAMS_NAME);
    cookies.delete(REDIRECT_OAUTH_PARAMS_NAME);
  }
  return oauthParamsStr;
}

function parseFromUrl(sdk, options: string | ParseFromUrlOptions): Promise<TokenResponse> {
  options = options || {};
  if (isString(options)) {
    options = { url: options } as ParseFromUrlOptions;
  } else {
    options = options as ParseFromUrlOptions;
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

  const oauthParamsStr = getOAuthParamsStrFromStorage();  
  if (!oauthParamsStr) {
    return Promise.reject(new AuthSdkError('Unable to retrieve OAuth redirect params from storage'));
  }

  try {
    var oauthParams = JSON.parse(oauthParamsStr);
    var urls = oauthParams.urls;
    delete oauthParams.urls;
  } catch(e) {
    return Promise.reject(new AuthSdkError('Unable to parse the ' +
    REDIRECT_OAUTH_PARAMS_NAME + ' value from storage: ' + e.message));
  }

  return Promise.resolve(urlParamsToObject(paramStr))
    .then(function(res) {
      if (!url) {
        // Clean hash or search from the url
        responseMode === 'query' ? removeSearch(sdk) : removeHash(sdk);
      }
      return handleOAuthResponse(sdk, oauthParams, res, urls);
    });
}

async function getUserInfo(sdk, accessTokenObject: AccessToken, idTokenObject: IDToken): Promise<UserClaims> {
  // If token objects were not passed, attempt to read from the TokenManager
  if (!accessTokenObject) {
    accessTokenObject = (await sdk.tokenManager.getTokens()).accessToken as AccessToken;
  }
  if (!idTokenObject) {
    idTokenObject = (await sdk.tokenManager.getTokens()).idToken as IDToken;
  }

  if (!accessTokenObject || !isAccessToken(accessTokenObject)) {
    return Promise.reject(new AuthSdkError('getUserInfo requires an access token object'));
  }

  if (!idTokenObject || !isIDToken(idTokenObject)) {
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
      if (err.xhr.headers && isFunction(err.xhr.headers.get) && err.xhr.headers.get('WWW-Authenticate')) {
        authenticateHeader = err.xhr.headers.get('WWW-Authenticate');
      } else if (isFunction(err.xhr.getResponseHeader)) {
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

export {
  revokeToken,
  getToken,
  getWithoutPrompt,
  getWithPopup,
  getWithRedirect,
  parseFromUrl,
  decodeToken,
  renewToken,
  renewTokens,
  getUserInfo,
  verifyToken,
  handleOAuthResponse,
  prepareTokenParams
};
