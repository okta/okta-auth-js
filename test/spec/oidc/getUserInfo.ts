import { OktaAuth, AccessToken, IDToken } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';

const _ = require('lodash');

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}

describe('token.getUserInfo', function() {
  let responseXHR;
  beforeEach(() => {
    responseXHR = _.cloneDeep(require('@okta/test.support/xhr/userinfo'));
    responseXHR.response.sub = tokens.standardIdTokenParsed.claims.sub;
  });

  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo with accessTokenObject and idTokenObject',
    setup: () => {
      return {
        request: {
          uri: '/oauth2/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': global['USER_AGENT'],
            'Authorization': 'Bearer ' + tokens.standardAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });


  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo with no arguments if valid tokens exist in token manager',
    setup: () => {
      return {
        request: {
          uri: '/oauth2/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': global['USER_AGENT'],
            'Authorization': 'Bearer ' + tokens.standardAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      util.warpToUnixTime(oauthUtil.getTime());
      test.oa.tokenManager.add('accessToken', tokens.standardAccessTokenParsed);
      test.oa.tokenManager.add('idToken', tokens.standardIdTokenParsed);
      return test.oa.token.getUserInfo();
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });

  util.itMakesCorrectRequestResponse({
    title: 'allows retrieving UserInfo using authorization server',
    setup: () => {
      responseXHR.response.sub = tokens.authServerIdTokenParsed.claims.sub;
      return {
        request: {
          uri: '/oauth2/aus8aus76q8iphupD0h7/v1/userinfo',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': global['USER_AGENT'],
            'Authorization': 'Bearer ' + tokens.authServerAccessToken
          }
        },
        response: responseXHR
      };
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.authServerAccessTokenParsed, tokens.authServerIdTokenParsed);
    },
    expectations: function(test, res) {
      expect(res).toEqual(responseXHR.response);
    }
  });

  it('throws an error if no arguments are passed', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve(undefined));
      return oa.token.getUserInfo();
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    });
  });

  it('throws an error if a string is passed instead of an accessToken object', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve(undefined));
      return oa.token.getUserInfo('just a string' as unknown as AccessToken);
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an access token object');
    });
  });

  it('throws an error if no idTokenObject is passed', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve(undefined));
      return oa.token.getUserInfo(tokens.standardAccessTokenParsed);
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an ID token object');
    });
  });

  it('throws an error if a string is passed instead of an idTokenObject', function() {
    return Promise.resolve(setupSync())
    .then(function(oa) {
      jest.spyOn(oa.tokenManager, 'get').mockReturnValue(Promise.resolve(undefined));
      return oa.token.getUserInfo(tokens.standardAccessTokenParsed, 'some string' as unknown as IDToken);
    })
    .then(function() {
      expect('not to be hit').toBe(true);
    })
    .catch(function(err) {
      expect(err.name).toEqual('AuthSdkError');
      expect(err.errorSummary).toBe('getUserInfo requires an ID token object');
    });
  });

  util.itErrorsCorrectly({
    title: 'returns correct error for 403',
    setup: {
      request: {
        uri: '/oauth2/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': global['USER_AGENT'],
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-insufficient-scope'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    },
    expectations: function(test, err) {
      expect(err.name).toEqual('OAuthError');
      expect(err.message).toEqual('The access token must provide access to at least one' +
        ' of these scopes - profile, email, address or phone');
      expect(err.errorCode).toEqual('insufficient_scope');
      expect(err.errorSummary).toEqual('The access token must provide access to at least one' +
        ' of these scopes - profile, email, address or phone');
    }
  });

  util.itErrorsCorrectly({
    title: 'returns correct error for 401',
    setup: {
      request: {
        uri: '/oauth2/v1/userinfo',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': global['USER_AGENT'],
          'Authorization': 'Bearer ' + tokens.standardAccessToken
        }
      },
      response: 'error-userinfo-invalid-token'
    },
    execute: function(test) {
      return test.oa.token.getUserInfo(tokens.standardAccessTokenParsed, tokens.standardIdTokenParsed);
    },
    expectations: function(test, err) {
      expect(err.name).toEqual('OAuthError');
      expect(err.message).toEqual('The access token is invalid.');
      expect(err.errorCode).toEqual('invalid_token');
      expect(err.errorSummary).toEqual('The access token is invalid.');
    }
  });
});