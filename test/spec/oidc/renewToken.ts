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


import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';

describe('token.renew', function() {
  it('returns id_token', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.standardIdTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: tokens.time,
      expectedResp: tokens.standardIdTokenParsed
    });
  });

  it('returns id_token with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.authServerIdTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: tokens.time,
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerIdTokenParsed
    });
  });

  it('returns access_token', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.standardAccessTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'access_token': tokens.standardAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.standardAccessTokenParsed
    });
  });

  it('returns access_token with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/wontusethisone',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [tokens.authServerAccessTokenParsed],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'access_token': tokens.authServerAccessToken,
        'token_type': 'Bearer',
        'expires_in': 3600,
        'state': oauthUtil.mockedState
      },
      expectedResp: tokens.authServerAccessTokenParsed
    });
  });

  it('throws an error if a non-token is passed', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
      errorCode: 'INTERNAL',
      errorSummary: 'Renew must be passed a token with an array of scopes and an accessToken or idToken',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupFrame({
      willFail: true,
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewArgs: [{non:'token'}]
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });
});
