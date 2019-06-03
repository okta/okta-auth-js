jest.mock('cross-fetch');

var Q = require('q');

var util = require('../util/util');
var factory = require('../util/factory');
var packageJson = require('../../package.json');
var AuthSdkError  = require('../../lib/errors/AuthSdkError');
var OktaAuth = require('../../lib/browser/browserIndex');
var http = require('../../lib/http');
var pkce = require('../../lib/pkce');
var token = require('../../lib/token');
var oauthUtil = require('../../lib/oauthUtil');

describe('pkce', function() {

  describe('prepare oauth params', function() {

    it('throws an error if grantType is "authorization_code" and PKCE is not supported', function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
      var sdk = new OktaAuth({ issuer: 'https://foo.com', grantType: 'implicit' });
      return token.prepareOauthParams(sdk, {
        grantType: 'authorization_code',
        responseType: 'code'
      })
      .then(function() {
        // Should never hit this
        expect(true).toBe(false);
      })
      .catch(function (e) {
        expect(e.name).toEqual('AuthSdkError');
        expect(e.errorSummary).toEqual('This browser doesn\'t support PKCE');
      });
    });
    
    describe('responseType', function() {
      it('Must be "code" if grantType is "authorization_code"', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        var sdk = new OktaAuth({ issuer: 'https://foo.com', grantType: 'authorization_code' });
        return token.prepareOauthParams(sdk, {
          responseType: 'token'
        })
        .then(function() {
          expect(false).toBe(true); // should not reach this line
        })
        .catch(function(e) {
          expect(e.name).toBe('AuthSdkError');
          expect(e.errorSummary).toBe('When grantType is "authorization_code", responseType should be "code"');
        });
  
      });
  
      it('Must not contain "code" if grantType is not "authorization_code"', function() {
        var sdk = new OktaAuth({ issuer: 'https://foo.com', grantType: 'implicit' });
        return token.prepareOauthParams(sdk, {
          responseType: ['token', 'code']
        })
        .then(function() {
          expect(false).toBe(true); // should not reach this line
        })
        .catch(function(e) {
          expect(e.name).toBe('AuthSdkError');
          expect(e.errorSummary).toBe('When responseType is "code", grantType should be "authorization_code"');
        });
      })
    });
  
    it('Checks codeChallengeMethod against well-known', function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      var sdk = new OktaAuth({ issuer: 'https://foo.com', grantType: 'authorization_code' });
      spyOn(oauthUtil, 'getWellKnown').and.returnValue(Q.resolve({
        'code_challenge_methods_supported': []
      }))
      return token.prepareOauthParams(sdk, {})
      .then(function() {
        expect(false).toBe(true); // should not reach this line
      })
      .catch(function(e) {
        expect(e.name).toBe('AuthSdkError');
        expect(e.errorSummary).toBe('Invalid code_challenge_method');
      });
    });

    it('Computes and returns a code challenge', function() {
      var codeChallengeMethod = 'fake';
      var codeVerifier = 'alsofake';
      var codeChallenge = 'ohsofake';

      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      var sdk = new OktaAuth({ issuer: 'https://foo.com', grantType: 'authorization_code' });
      spyOn(oauthUtil, 'getWellKnown').and.returnValue(Q.resolve({
        'code_challenge_methods_supported': [codeChallengeMethod]
      }));
      spyOn(pkce, 'generateVerifier').and.returnValue(codeVerifier);
      spyOn(pkce, 'saveMeta');
      spyOn(pkce, 'computeChallenge').and.returnValue(Q.resolve(codeChallenge));
      return token.prepareOauthParams(sdk, {
        codeChallengeMethod: codeChallengeMethod
      })
      .then(function(oauthParams) {
        expect(oauthParams.codeChallenge).toBe(codeChallenge);
      })
    });
    
  });

  describe('getToken', function() {
    var ISSUER = 'http://example.okta.com';
    var REDIRECT_URI = 'http://fake.local';
    var CLIENT_ID = 'fake';
    var endpoint = '/oauth2/v1/token';
    var codeVerifier = 'superfake';
    var authorizationCode = 'notreal';
    var grantType = 'authorization_code';

    util.itMakesCorrectRequestResponse({
      title: 'requests a token',
      setup: {
        uri: ISSUER,
        bypassCrypto: true,
        calls: [
          {
            request: {
              method: 'post',
              uri: endpoint,
              withCredentials: false,
              data: {
                client_id: CLIENT_ID,
                grant_type: grantType,
                redirect_uri: REDIRECT_URI
              },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version
              }
            },
            response: 'pkce-token-success',
            responseVars: {
              scope: 'also fake',
              accessToken: 'fake access token',
              idToken: factory.buildIDToken({
                issuer: ISSUER,
                clientId: CLIENT_ID
              })
            }
          }
        ]
      },
      execute: function (test) {
        return pkce.getToken(test.oa, {
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationCode: authorizationCode,
          codeVerifier: codeVerifier,
          grantType: grantType,
        }, {
          tokenUrl: ISSUER + endpoint
        });
      }
    });

    describe('validateOptions', function() {
      var authClient;
      var oauthOptions;

      beforeEach(function() {
        authClient = new OktaAuth({
          url: 'https://auth-js-test.okta.com'
        });

        oauthOptions = {
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationCode: authorizationCode,
          codeVerifier: codeVerifier,
          grantType: grantType,
        };
      });

      it('Does not throw if options are valid', function() {
        var httpRequst = jest.spyOn(http, 'httpRequest').mockImplementation();
        var urls = {
          tokenUrl: 'http://superfake'
        };
        pkce.getToken(authClient, oauthOptions, urls);
        expect(httpRequst).toHaveBeenCalled();
      });
  
      it('Throws if no clientId', function() {
        oauthOptions.clientId = undefined;
        try {
          pkce.getToken(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('A clientId must be specified in the OktaAuth constructor to get a token');
        }
      });

      it('Throws if no redirectUri', function() {
        oauthOptions.redirectUri = undefined;
        try {
          pkce.getToken(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('The redirectUri passed to /authorize must also be passed to /token');
        }
      });

      it('Throws if no authorizationCode', function() {
        oauthOptions.authorizationCode = undefined;
        try {
          pkce.getToken(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('An authorization code (returned from /authorize) must be passed to /token');
        }
      });

      it('Throws if no codeVerifier', function() {
        oauthOptions.codeVerifier = undefined;
        try {
          pkce.getToken(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('The "codeVerifier" (generated and saved by your app) must be passed to /token');
        }
      });

      it('Throws if grantType is not "authorization_code', function() {
        oauthOptions.grantType = 'implicit';
        try {
          pkce.getToken(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('Expecting "grantType" to equal "authorization_code"');
        }
      });
    });
  });

});