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


/* global window */

// mock OAuth util
const generateState = jest.fn();
jest.mock('../../../lib/oidc/util/oauth', () => {
  const { generateNonce, getOAuthUrls } = jest.requireActual('../../../lib/oidc/util/oauth');
  return { generateState, generateNonce, getOAuthUrls };
});

// mock getWellKnown
const getWellKnown = jest.fn();
jest.mock('../../../lib/oidc/endpoints/well-known', () => {
  const { getKey } = jest.requireActual('../../../lib/oidc/endpoints/well-known');
  return { getWellKnown, getKey };
});

import { OktaAuth } from '@okta/okta-auth-js';
import TransactionManager from '../../../lib/TransactionManager';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import * as token from '../../../lib/oidc';
const pkce = token.pkce;

// eslint-disable-next-line max-statements
describe('token.getWithRedirect', function() {
  var codeChallengeMethod = 'S256';
  var codeChallenge = 'fake';
  var originalLocation;

  afterEach(() => {
    global.window.location = originalLocation;
  });

  beforeEach(function() {
    generateState.mockReturnValue(oauthUtil.mockedState);

    // mock window.location so we appear to be on an HTTPS origin
    originalLocation = global.window.location;
    delete (global.window as any).location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local'
    } as Location;
  });
  
  afterEach(() => {
    window.location = originalLocation;
  });

  function mockPKCE() {
    spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
    getWellKnown.mockReturnValue(Promise.resolve({
      'code_challenge_methods_supported': [codeChallengeMethod]
    }));
    spyOn(pkce, 'generateVerifier');
    spyOn(TransactionManager.prototype, 'save').and.callThrough();
    spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve(codeChallenge));
  }

  it('If extra options are passed, promise will reject', function() {
    return oauthUtil.setupRedirect({
      willFail: true,
      oktaAuthArgs: {
        issuer: 'https://auth-js-test.okta.com',
      },
      getWithRedirectArgs: [{
        /* expected options */
      }, {
        /* extra options */
      }]
    })
    .then(function() {
      expect(true).toEqual(false);
    })
    .catch(function(err) {
      util.expectErrorToEqual(err, {
        name: 'AuthSdkError',
        message: 'As of version 3.0, "getWithRedirect" takes only a single set of options',
        errorCode: 'INTERNAL',
        errorSummary: 'As of version 3.0, "getWithRedirect" takes only a single set of options',
        errorLink: 'INTERNAL',
        errorId: 'INTERNAL',
        errorCauses: []
      });
    });
  });

  it('PKCE: Can pass responseMode=fragment', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true
      },
      getWithRedirectArgs: {
        responseMode: 'fragment',
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=fragment&' +
                            'response_type=code&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: Can set responseMode=fragment on SDK instance', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true,
        responseMode: 'fragment'
      },
      getWithRedirectArgs: {},
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=fragment&' +
                            'response_type=code&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url and cookie using sessionToken', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url and cookie using sessionToken and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('allows passing issuer through getWithRedirect, which takes precedence', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/ORIGINAL_AUTH_SERVER_ID',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: [{
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken',
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7'
      }],
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and don\'t throw an error if openid isn\'t included in scope', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url and cookie for access_token using sessionToken and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        responseType: 'token',
        scopes: ['email'],
        sessionToken: 'testToken'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=email'
    });
  });

  it('sets authorize url for access_token and id_token using idp', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp=testIdp&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for access_token and id_token using idp and authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        responseType: ['token', 'id_token'],
        idp: 'testIdp'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp=testIdp&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: sets authorize url for authorization code requests', function() {
    mockPKCE();
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: true,
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken',
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'code_challenge=' + codeChallenge + '&' +
                            'code_challenge_method=' + codeChallengeMethod + '&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code requests with an authorization server', function() {
    return oauthUtil.setupRedirect({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('sets authorize url for authorization code (as an array) requests, ' +
    'defaulting responseMode to query', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: ['code']
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('PKCE: sets authorize url for authorization code (as an array) requests, ' +
  'defaulting responseMode to fragment', function() {
  mockPKCE();
  return oauthUtil.setupRedirect({
    oktaAuthArgs: {
      pkce: true,
    },
    getWithRedirectArgs: {
      sessionToken: 'testToken',
      responseType: ['code']
    },
    expectedCookies: [],
    expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                          'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                          'code_challenge=' + codeChallenge + '&' +
                          'code_challenge_method=' + codeChallengeMethod + '&' +
                          'nonce=' + oauthUtil.mockedNonce + '&' +
                          'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                          'response_type=code&' +
                          'sessionToken=testToken&' +
                          'state=' + oauthUtil.mockedState + '&' +
                          'scope=openid%20email'
  });
});

  it('sets authorize url for authorization code requests, allowing form_post responseMode', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        sessionToken: 'testToken',
        responseType: 'code',
        responseMode: 'form_post'
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_mode=form_post&' +
                            'response_type=code&' +
                            'sessionToken=testToken&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional login_hint query param through', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        loginHint: 'JoeUser',
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'login_hint=JoeUser&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional idp_scope query param through when given a string', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        idpScope: 'scope1 scope2',
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp_scope=scope1%20scope2&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

  it('passes optional idp_scope query param through when given an array of strings', function() {
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {
        idpScope: ['scope1', 'scope2'],
      },
      expectedCookies: [],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'idp_scope=scope1%20scope2&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

});