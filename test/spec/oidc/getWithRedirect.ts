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

import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import TransactionManager from '../../../lib/TransactionManager';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import * as token from '../../../lib/oidc';
const pkce = token.pkce;

// Expected settings when testing on HTTP protocol
var insecureCookieSettings = {
  secure: false,
  sameSite: 'lax'
};

// Expected settings when testing on HTTPS protocol
var secureCookieSettings = {
  secure: true,
  sameSite: 'none'
};

// eslint-disable-next-line max-statements
describe('token.getWithRedirect', function() {
  var codeChallengeMethod = 'S256';
  var codeChallenge = 'fake';
  var defaultUrls;
  var customUrls;
  var nonceCookie;
  var stateCookie;
  var originalLocation;

  afterEach(() => {
    global.window.location = originalLocation;
  });

  beforeEach(function() {
    generateState.mockReturnValue(oauthUtil.mockedState);

    // mock window.location so we appear to be on an HTTPS origin
    originalLocation = global.window.location;
    delete global.window.location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local'
    } as Location;

    defaultUrls = {
      issuer: 'https://auth-js-test.okta.com',
      authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
      userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo',
      tokenUrl: 'https://auth-js-test.okta.com/oauth2/v1/token',
      revokeUrl: 'https://auth-js-test.okta.com/oauth2/v1/revoke',
      logoutUrl: 'https://auth-js-test.okta.com/oauth2/v1/logout',
    };
    customUrls = {
      issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
      authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
      userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo',
      tokenUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/token',
      revokeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/revoke',
      logoutUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/logout',
    };
    nonceCookie = [
      'okta-oauth-nonce',
      oauthUtil.mockedNonce,
      null, // expiresAt
      secureCookieSettings
    ];

    stateCookie =  [
      'okta-oauth-state',
      oauthUtil.mockedState,
      null, // expiresAt
      secureCookieSettings
    ];
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
  it('Uses insecure cookie settings if running on http://localhost', function() {
    delete window.location;
    window.location = {
      protocol: 'http:',
      hostname: 'localhost'
    } as Location;
    return oauthUtil.setupRedirect({
      getWithRedirectArgs: {},
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, 
          insecureCookieSettings
        ],
        [
          'okta-oauth-nonce',
          oauthUtil.mockedNonce,
          null, // expiresAt
          insecureCookieSettings
        ],
        [
          'okta-oauth-state',
          oauthUtil.mockedState,
          null, // expiresAt
          insecureCookieSettings
        ]
      ],
      expectedRedirectUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize?' +
                            'client_id=NPSfOkH5eZrTy8PMDlvx&' +
                            'nonce=' + oauthUtil.mockedNonce + '&' +
                            'redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&' +
                            'response_type=token%20id_token&' +
                            'state=' + oauthUtil.mockedState + '&' +
                            'scope=openid%20email'
    });
  });

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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'token',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: customUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['code'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
    expectedCookies: [
      [
        'okta-oauth-redirect-params',
        JSON.stringify({
          responseType: 'code',
          state: oauthUtil.mockedState,
          nonce: oauthUtil.mockedNonce,
          scopes: ['openid', 'email'],
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          urls: defaultUrls,
          ignoreSignature: false
        }),
        null,
        secureCookieSettings
      ],
      nonceCookie,
      stateCookie
    ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: 'code',
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
          null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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
      expectedCookies: [
        [
          'okta-oauth-redirect-params',
          JSON.stringify({
            responseType: ['token', 'id_token'],
            state: oauthUtil.mockedState,
            nonce: oauthUtil.mockedNonce,
            scopes: ['openid', 'email'],
            clientId: 'NPSfOkH5eZrTy8PMDlvx',
            urls: defaultUrls,
            ignoreSignature: false
          }),
        null, secureCookieSettings],
        nonceCookie,
        stateCookie
      ],
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