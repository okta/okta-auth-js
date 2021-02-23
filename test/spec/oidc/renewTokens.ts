import tokens from '@okta/test.support/tokens';
import oauthUtil from '@okta/test.support/oauthUtil';
import { OktaAuth } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import * as tokenEndpoint from '../../../lib/oidc/endpoints/token';


describe('token.renewTokens', function() {
  it('should return tokens', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.standardIdToken,
        'access_token': tokens.standardAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ accessToken, idToken }) => {
        oauthUtil.validateResponse(accessToken, tokens.standardAccessTokenParsed);
        oauthUtil.validateResponse(idToken, tokens.standardIdTokenParsed);
      }
    });
  });

  it('should return tokens with authorization server', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.authServerIdToken,
        'access_token': tokens.authServerAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: (res) => {
        oauthUtil.validateResponse(res.accessToken, tokens.authServerAccessTokenParsed);
        oauthUtil.validateResponse(res.idToken, tokens.authServerIdTokenParsed);
      }
    });
  });

  it('should accept tokenParams options', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect'
      },
      tokenRenewTokensArgs: [{ scopes: ['openid', 'email', 'profile'] }],
      postMessageSrc: {
        baseUri: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
        queryParams: {
          'client_id': 'NPSfOkH5eZrTy8PMDlvx',
          'redirect_uri': 'https://example.com/redirect',
          'response_type': 'token id_token',
          'response_mode': 'okta_post_message',
          'state': oauthUtil.mockedState,
          'nonce': oauthUtil.mockedNonce,
          'scope': 'openid email profile',
          'prompt': 'none'
        }
      },
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.standardIdToken,
        'access_token': tokens.standardAccessToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ accessToken, idToken }) => {
        oauthUtil.validateResponse(accessToken, tokens.standardAccessTokenParsed);
        oauthUtil.validateResponse(idToken, tokens.standardIdTokenParsed);
      }
    });
  });

  it('returns access token when SDK is configured with { responseType: \'token\' }', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        responseType: ['token'],
      },
      tokenRenewTokensArgs: [],
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
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ accessToken }) => {
        oauthUtil.validateResponse(accessToken, tokens.standardAccessTokenParsed);
      }
    });
  });

  it('returns ID token when SDK is configured with { responseType: \'id_token\' }', function() {
    return oauthUtil.setupFrame({
      oktaAuthArgs: {
        pkce: false,
        issuer: 'https://auth-js-test.okta.com',
        clientId: 'NPSfOkH5eZrTy8PMDlvx',
        redirectUri: 'https://example.com/redirect',
        responseType: ['id_token'],
      },
      tokenRenewTokensArgs: [],
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
      time: 1449699929,
      postMessageResp: {
        'id_token': tokens.standardIdToken,
        'expires_in': 3600,
        'token_type': 'Bearer',
        'state': oauthUtil.mockedState
      },
      validateFunc: ({ idToken }) => {
        oauthUtil.validateResponse(idToken, tokens.standardIdTokenParsed);
      }
    });
  });

  describe('renewTokensWithRefresh', function () {
    beforeEach(function () {
      util.warpToUnixTime(tokens.standardIdToken2Claims.iat);
      jest.spyOn(tokenEndpoint, 'postRefreshToken').mockImplementation(function () {

        return Promise.resolve({
          'id_token': tokens.standardIdToken,
          'refresh_token': 'fakeRerfeshTalken'
        });
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('is called when refresh token is available in browser storage', async function() {
      const authInstance = new OktaAuth({
          issuer: 'https://auth-js-test.okta.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
      });
      authInstance.tokenManager.add('refreshToken', tokens.standardRefreshToken);
      const newTokens = await authInstance.token.renewTokens();
      expect(Object.keys(newTokens)).toContain('idToken');
      expect(Object.keys(newTokens)).toContain('refreshToken');
    });
  });

});
