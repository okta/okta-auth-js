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

jest.mock('../../../lib/http', () => {
  const actual = jest.requireActual('../../../lib/http');
  return {
    httpRequest: actual.httpRequest,
    get: actual.get,
    setRequestHeader: actual.setRequestHeader
  };
});

const mocked = {
  http: require('../../../lib/http')
};

import { OktaAuth } from '@okta/okta-auth-js';
import { createTransactionManager } from '../../../lib/oidc/TransactionManager';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import { isInteractionRequiredError } from '../../../lib/oidc';

const TransactionManager = createTransactionManager();

describe('token.parseFromUrl', function() {
  function mockPKCE(response) {
    var codeVerifier = 'fake';
    var redirectUri = 'https://example.com/redirect';
  
    spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
    spyOn(TransactionManager.prototype, 'load').and.returnValue({
      codeVerifier,
      redirectUri
    });
    spyOn(TransactionManager.prototype, 'clear').and.callThrough();
    spyOn(mocked.http, 'httpRequest').and.returnValue(Promise.resolve(response));
  }

  it('authorization_code: Will return code', function() {
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: false,
        responseMode: 'query',
        responseType: ['code']
      },
      searchMock: '?code=fake' +
      '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['code'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {}
      }
    });
  });

  it('does not change the hash if a url is passed directly', function() {
    return oauthUtil.setupParseUrl({
      parseFromUrlArgs: 'http://example.com#id_token=' + tokens.standardIdToken +
        '&access_token=' + tokens.standardAccessToken +
        '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('does not change the hash if a url is passed as an option', function() {
    return oauthUtil.setupParseUrl({
      parseFromUrlArgs: {
        url: 'http://example.com#id_token=' + tokens.standardIdToken +
          '&access_token=' + tokens.standardAccessToken +    
          '&state=' + oauthUtil.mockedState,
      },
      savedTransaction: {
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: can parse code in query', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true
      },
      searchMock: '?code=fake' + 
        '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        codeVerifier: 'foo',
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      calls: [
        {
          request: {
            uri: '/api/v1/token'
          },
          response: 'empty'
        }
      ],
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: can pass responseMode=fragment in options', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true
      },
      parseFromUrlArgs: {
        responseMode: 'fragment'
      },
      hashMock: '#code=fake' + 
        '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        codeVerifier: 'foo',
        responseType: ['token', 'id_token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('PKCE: Can set responseMode=fragment in SDK options', function() {
    mockPKCE({
      id_token: tokens.standardIdToken,
      access_token: tokens.standardAccessToken
    });
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true,
        responseMode: 'fragment'
      },
      hashMock: '#code=fake' +
      '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        codeVerifier: 'foo',
        responseType: ['token', 'id_token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        code: 'fake',
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('uses location.hash to remove token if history.replaceState does not exist', function() {
    return oauthUtil.setupParseUrl({
      noHistory: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('parses id_token', function() {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: {
            idToken: tokens.standardIdToken,
            claims: tokens.standardIdTokenClaims,
            expiresAt: 1449699930,
            scopes: ['openid', 'email']
          }
        }
      }
    });
  });

  it('parses id_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      hashMock: '#id_token=' + tokens.authServerIdToken +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: 'id_token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('parses access_token', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: 'token',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed
        }
      }
    });
  });

  it('parses access_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: 'token',
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.authServerAccessTokenParsed
        }
      }
    });
  });

  it('parses access_token and id_token', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.standardAccessTokenParsed,
          idToken: tokens.standardIdTokenParsed
        }
      }
    });
  });

  it('parses access_token and id_token with authorization server issuer', function() {
    return oauthUtil.setupParseUrl({
      time: 1449699929,
      hashMock: '#access_token=' + tokens.authServerAccessToken +
                '&id_token=' + tokens.authServerIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
        }
      },
      expectedResp: {
        state: oauthUtil.mockedState,
        tokens: {
          accessToken: tokens.authServerAccessTokenParsed,
          idToken: tokens.authServerIdTokenParsed
        }
      }
    });
  });

  it('throws an error if nothing to parse', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse a token from the url',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse a token from the url',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      shouldClearTransaction: false,
      hashMock: '',
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });

  });

  it('throws an error if state doesn\'t match', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'OAuth flow response state doesn\'t match request state',
      errorCode: 'INTERNAL',
      errorSummary: 'OAuth flow response state doesn\'t match request state',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };

    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: 'mismatchedState',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if nonce doesn\'t match', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'OAuth flow response nonce doesn\'t match request nonce',
      errorCode: 'INTERNAL',
      errorSummary: 'OAuth flow response nonce doesn\'t match request nonce',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'mismatchedNonce',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if access_token was not returned', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if id_token was not returned', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#access_token=' + tokens.standardAccessToken +
                '&expires_in=3600' +
                '&token_type=Bearer' +
                '&state=' + oauthUtil.mockedState,
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: oauthUtil.mockedState,
        nonce: oauthUtil.mockedNonce,
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an OAuthError error if "error" and "error_description" in the url', () => {
    const error = {
      name: 'OAuthError',
      message: 'fake_description',
      errorCode: 'fake_error',
      errorSummary: 'fake_description',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      willFail: true,
      hashMock: '#error=fake_error&error_description=fake_description',
      savedTransaction: {
        responseType: ['id_token', 'token'],
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        scopes: ['openid', 'email'],
        urls: {
          issuer: 'https://auth-js-test.okta.com',
          tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
          authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
          userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
        }
      }
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('throws an error if no transaction meta', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Unable to retrieve OAuth redirect params from storage',
      errorCode: 'INTERNAL',
      errorSummary: 'Unable to retrieve OAuth redirect params from storage',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      shouldClearTransaction: false,
      willFail: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  it('PKCE: throws an error if no transaction meta', () => {
    const error = {
      name: 'AuthSdkError',
      message: 'Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.',
      errorCode: 'INTERNAL',
      errorSummary: 'Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.',
      errorLink: 'INTERNAL',
      errorId: 'INTERNAL',
      errorCauses: []
    };
    return oauthUtil.setupParseUrl({
      oktaAuthArgs: {
        pkce: true
      },
      shouldClearTransaction: false,
      willFail: true,
      hashMock: '#id_token=' + tokens.standardIdToken +
                '&state=' + oauthUtil.mockedState,
    })
    .catch(function(e) {
      util.expectErrorToEqual(e, error);
    });
  });

  describe('interaction code flow', () => {
    it('Does not clear storage when "error" param is "interaction_required"', () => {
      const error = {
        name: 'OAuthError',
        message: 'fake_description',
        errorCode: 'interaction_required',
        errorSummary: 'fake_description',
        errorId: 'INTERNAL',
        errorCauses: []
      };
      return oauthUtil.setupParseUrl({
        willFail: true,
        shouldClearTransaction: false,
        hashMock: '#error=interaction_required&error_description=fake_description',
        savedTransaction: {
          responseType: ['id_token', 'token'],
          state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          nonce: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          scopes: ['openid', 'email'],
          urls: {
            issuer: 'https://auth-js-test.okta.com',
            tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
            authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
            userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
          }
        }
      })
      .catch(function(e) {
        util.expectErrorToEqual(e, error);
        expect(isInteractionRequiredError(e)).toBe(true);
      });
    });
  });


});