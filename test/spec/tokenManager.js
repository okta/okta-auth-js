define(function(require) {
  var OktaAuth = require('OktaAuth');
  var tokens = require('../util/tokens');
  var util = require('../util/util');

  function setupSync(options) {
    options = options || {};
    return new OktaAuth({
      url: 'https://auth-js-test.okta.com',
      tokenManager: {
        storage: options.type
      }
    });
  }

  beforeEach(function() {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('TokenManager', function() {
    describe('general', function() {
      it('defaults to localStorage', function() {
        var client = setupSync();
        client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
        expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
          'test-idToken': tokens.standardIdTokenParsed
        }));
      });

      it('throws an error when attempting to add a non-token', function() {
        var client = setupSync();
        try {
          client.tokenManager.add('test-idToken', [
            tokens.standardIdTokenParsed,
            tokens.standardIdTokenParsed
          ]);

          // Should never hit this
          expect(true).toEqual(false);
        } catch (e) {
          util.expectErrorToEqual(e, {
            name: 'AuthSdkError',
            message: 'Token must be an Object',
            errorCode: 'INTERNAL',
            errorSummary: 'Token must be an Object',
            errorLink: 'INTERNAL',
            errorId: 'INTERNAL',
            errorCauses: []
          });
        }
      });
    });

    describe('localStorage', function() {

      function localStorageSetup() {
        return setupSync({
          type: 'localStorage'
        });
      }

      describe('add', function() {
        it('adds a token', function() {
          var client = localStorageSetup();
          client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
          expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }));
        });
      });

      describe('get', function() {
        it('gets a token', function() {
          var client = localStorageSetup();
          localStorage.setItem('okta-token-storage', JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }));
          var result = client.tokenManager.get('test-idToken');
          expect(result).toEqual(tokens.standardIdTokenParsed);
        });
      });

      describe('remove', function() {
        it('removes a token', function() {
          var client = localStorageSetup();
          localStorage.setItem('okta-token-storage', JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed,
            anotherKey: tokens.standardIdTokenParsed
          }));
          client.tokenManager.remove('test-idToken');
          expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
            anotherKey: tokens.standardIdTokenParsed
          }));
        });
      });
    });

    describe('sessionStorage', function() {

      function sessionStorageSetup() {
        return setupSync({
          type: 'sessionStorage'
        });
      }

      describe('add', function() {
        it('adds a token', function() {
          var client = sessionStorageSetup();
          client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
          expect(sessionStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }));
        });
      });

      describe('get', function() {
        it('gets a token', function() {
          var client = sessionStorageSetup();
          sessionStorage.setItem('okta-token-storage', JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }));
          var result = client.tokenManager.get('test-idToken');
          expect(result).toEqual(tokens.standardIdTokenParsed);
        });
      });

      describe('remove', function() {
        it('removes a token', function() {
          var client = sessionStorageSetup();
          sessionStorage.setItem('okta-token-storage', JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed,
            anotherKey: tokens.standardIdTokenParsed
          }));
          client.tokenManager.remove('test-idToken');
          expect(sessionStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
            anotherKey: tokens.standardIdTokenParsed
          }));
        });
      });
    });


    describe('cookie', function() {

      function cookieStorageSetup() {
        return setupSync({
          type: 'cookie'
        });
      }

      describe('add', function() {
        it('adds a token', function() {
          var client = cookieStorageSetup();
          util.mockGetCookie('');
          var setCookieMock = util.mockSetCookie();
          client.tokenManager.add('test-idToken', tokens.standardIdTokenParsed);
          expect(setCookieMock).toHaveBeenCalledWith('okta-token-storage=' + JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }) + '; expires=Tue, 19 Jan 2038 03:14:07 GMT;');
        });
      });

      describe('get', function() {
        it('gets a token', function() {
          var client = cookieStorageSetup();
          util.mockGetCookie('okta-token-storage=' + JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed
          }) + ';');
          var result = client.tokenManager.get('test-idToken');
          expect(result).toEqual(tokens.standardIdTokenParsed);
        });
      });

      describe('remove', function() {
        it('removes a token', function() {
          var client = cookieStorageSetup();
          util.mockGetCookie('okta-token-storage=' + JSON.stringify({
            'test-idToken': tokens.standardIdTokenParsed,
            anotherKey: tokens.standardIdTokenParsed
          }) + ';');
          var setCookieMock = util.mockSetCookie();
          client.tokenManager.remove('test-idToken');
          expect(setCookieMock).toHaveBeenCalledWith('okta-token-storage=' + JSON.stringify({
            anotherKey: tokens.standardIdTokenParsed
          }) + '; expires=Tue, 19 Jan 2038 03:14:07 GMT;');
        });
      });
    });
  });
});
