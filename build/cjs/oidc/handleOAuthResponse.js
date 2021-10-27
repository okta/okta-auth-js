"use strict";

exports.handleOAuthResponse = handleOAuthResponse;

var _util = require("../util");

var _oauth = require("./util/oauth");

var _errors = require("../errors");

var _exchangeCodeForTokens = require("./exchangeCodeForTokens");

var _verifyToken = require("./verifyToken");

var _ = require(".");

/* eslint-disable complexity, max-statements */

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
function validateResponse(res, oauthParams) {
  if (res['error'] || res['error_description']) {
    throw new _errors.OAuthError(res['error'], res['error_description']);
  }

  if (res.state !== oauthParams.state) {
    throw new _errors.AuthSdkError('OAuth flow response state doesn\'t match request state');
  }
} // eslint-disable-next-line max-len


function handleOAuthResponse(sdk, tokenParams, res, urls) {
  var pkce = sdk.options.pkce !== false; // The result contains an authorization_code and PKCE is enabled 
  // `exchangeCodeForTokens` will call /token then call `handleOauthResponse` recursively with the result

  if (pkce && (res.code || res.interaction_code)) {
    return (0, _exchangeCodeForTokens.exchangeCodeForTokens)(sdk, Object.assign({}, tokenParams, {
      authorizationCode: res.code,
      interactionCode: res.interaction_code
    }), urls);
  }

  tokenParams = tokenParams || (0, _.getDefaultTokenParams)(sdk);
  urls = urls || (0, _oauth.getOAuthUrls)(sdk, tokenParams);
  var responseType = tokenParams.responseType;

  if (!Array.isArray(responseType)) {
    responseType = [responseType];
  }

  var scopes;

  if (res.scope) {
    scopes = res.scope.split(' ');
  } else {
    scopes = (0, _util.clone)(tokenParams.scopes);
  }

  var clientId = tokenParams.clientId || sdk.options.clientId; // Handling the result from implicit flow or PKCE token exchange

  return Promise.resolve().then(function () {
    validateResponse(res, tokenParams);
  }).then(function () {
    var tokenDict = {};
    var expiresIn = res.expires_in;
    var tokenType = res.token_type;
    var accessToken = res.access_token;
    var idToken = res.id_token;
    var refreshToken = res.refresh_token;
    var now = Math.floor(Date.now() / 1000);

    if (accessToken) {
      var accessJwt = sdk.token.decode(accessToken);
      tokenDict.accessToken = {
        accessToken: accessToken,
        claims: accessJwt.payload,
        expiresAt: Number(expiresIn) + now,
        tokenType: tokenType,
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        userinfoUrl: urls.userinfoUrl
      };
    }

    if (refreshToken) {
      tokenDict.refreshToken = {
        refreshToken: refreshToken,
        // should not be used, this is the accessToken expire time
        // TODO: remove "expiresAt" in the next major version OKTA-407224
        expiresAt: Number(expiresIn) + now,
        scopes: scopes,
        tokenUrl: urls.tokenUrl,
        authorizeUrl: urls.authorizeUrl,
        issuer: urls.issuer
      };
    }

    if (idToken) {
      var idJwt = sdk.token.decode(idToken);
      var idTokenObj = {
        idToken: idToken,
        claims: idJwt.payload,
        expiresAt: idJwt.payload.exp - idJwt.payload.iat + now,
        // adjusting expiresAt to be in local time
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl,
        issuer: urls.issuer,
        clientId: clientId
      };
      var validationParams = {
        clientId: clientId,
        issuer: urls.issuer,
        nonce: tokenParams.nonce,
        accessToken: accessToken
      };

      if (tokenParams.ignoreSignature !== undefined) {
        validationParams.ignoreSignature = tokenParams.ignoreSignature;
      }

      return (0, _verifyToken.verifyToken)(sdk, idTokenObj, validationParams).then(function () {
        tokenDict.idToken = idTokenObj;
        return tokenDict;
      });
    }

    return tokenDict;
  }).then(function (tokenDict) {
    // Validate received tokens against requested response types 
    if (responseType.indexOf('token') !== -1 && !tokenDict.accessToken) {
      // eslint-disable-next-line max-len
      throw new _errors.AuthSdkError('Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.');
    }

    if (responseType.indexOf('id_token') !== -1 && !tokenDict.idToken) {
      // eslint-disable-next-line max-len
      throw new _errors.AuthSdkError('Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.');
    }

    return {
      tokens: tokenDict,
      state: res.state,
      code: res.code
    };
  });
}
//# sourceMappingURL=handleOAuthResponse.js.map