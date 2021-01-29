jest.mock('cross-fetch');

import util from '@okta/test.support/util';
import factory from '@okta/test.support/factory';
import packageJson from '../../package.json';
import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import http from '../../lib/http';
import pkce from '../../lib/pkce';
import * as token from '../../lib/token';
import * as oauthUtil from '../../lib/oauthUtil';

describe('pkce', function() {
  
  describe('prepare token params', function() {

    it('throws an error if pkce is true and PKCE is not supported', function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
      var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: false });
      return token.prepareTokenParams(sdk, {
        pkce: true,
      })
      .then(function() {
        // Should never hit this
        expect(true).toBe(false);
      })
      .catch(function (e) {
        expect(e.name).toEqual('AuthSdkError');
        expect(e.errorSummary).toEqual(
          'PKCE requires a modern browser with encryption support running in a secure context.\n' +
          'The current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.'
        );
      });
    });
    
    describe('responseType', function() {
      it('Is set to "code" if pkce is true', function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        spyOn(oauthUtil, 'getWellKnown').and.returnValue(Promise.resolve({
          code_challenge_methods_supported: ['S256']
        }));

        spyOn(pkce, 'generateVerifier').and.returnValue(Promise.resolve());
        spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve());
        
        var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
        return token.prepareTokenParams(sdk, {
          responseType: 'token'
        })
        .then(function(params) {
          expect(params.responseType).toBe('code');
        });
  
      });
    });
  
    it('Checks codeChallengeMethod against well-known', function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
      spyOn(oauthUtil, 'getWellKnown').and.returnValue(Promise.resolve({
        'code_challenge_methods_supported': []
      }));
      return token.prepareTokenParams(sdk, {})
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
      var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
      spyOn(oauthUtil, 'getWellKnown').and.returnValue(Promise.resolve({
        'code_challenge_methods_supported': [codeChallengeMethod]
      }));
      spyOn(pkce, 'generateVerifier').and.returnValue(codeVerifier);
      spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve(codeChallenge));
      return token.prepareTokenParams(sdk, {
        codeChallengeMethod: codeChallengeMethod
      })
      .then(function(oauthParams) {
        expect(oauthParams.codeChallenge).toBe(codeChallenge);
      });
    });
    
  });

  describe('exchangeCodeForTokens', function() {
    var ISSUER = 'http://example.okta.com';
    var REDIRECT_URI = 'http://fake.local';
    var CLIENT_ID = 'fake';
    var endpoint = '/oauth2/v1/token';
    var codeVerifier = 'superfake';
    var authorizationCode = 'notreal';

    util.itMakesCorrectRequestResponse({
      title: 'requests a token',
      setup: {
        issuer: ISSUER,
        bypassCrypto: true,
        calls: [
          {
            request: {
              method: 'post',
              uri: endpoint,
              withCredentials: false,
              data: {
                client_id: CLIENT_ID,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
              },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version
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
        return pkce.exchangeCodeForTokens(test.oa, {
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationCode: authorizationCode,
          codeVerifier: codeVerifier,
        }, {
          tokenUrl: ISSUER + endpoint
        });
      }
    });

    describe('validateOptions', function() {
      var authClient;
      var oauthOptions;

      beforeEach(function() {
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
        authClient = new OktaAuth({
          issuer: 'https://auth-js-test.okta.com'
        });

        oauthOptions = {
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationCode: authorizationCode,
          codeVerifier: codeVerifier,
        };
      });

      it('Does not throw if options are valid', function() {
        var httpRequst = jest.spyOn(http, 'httpRequest').mockImplementation();
        var urls = {
          tokenUrl: 'http://superfake'
        };
        pkce.exchangeCodeForTokens(authClient, oauthOptions, urls);
        expect(httpRequst).toHaveBeenCalled();
      });
  
      it('Throws if no clientId', function() {
        oauthOptions.clientId = undefined;
        try {
          pkce.exchangeCodeForTokens(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('A clientId must be specified in the OktaAuth constructor to get a token');
        }
      });

      it('Throws if no redirectUri', function() {
        oauthOptions.redirectUri = undefined;
        try {
          pkce.exchangeCodeForTokens(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('The redirectUri passed to /authorize must also be passed to /token');
        }
      });

      it('Throws if no authorizationCode', function() {
        oauthOptions.authorizationCode = undefined;
        try {
          pkce.exchangeCodeForTokens(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('An authorization code (returned from /authorize) must be passed to /token');
        }
      });

      it('Throws if no codeVerifier', function() {
        oauthOptions.codeVerifier = undefined;
        try {
          pkce.exchangeCodeForTokens(authClient, oauthOptions);
        } catch(e) {
          expect(e instanceof AuthSdkError).toBe(true);
          expect(e.message).toBe('The "codeVerifier" (generated and saved by your app) must be passed to /token');
        }
      });

    });
  });

});