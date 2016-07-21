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

  describe('general tokenManager', function() {
    it('defaults to localStorage', function() {
      var client = setupSync();
      client.tokenManager.add('key', tokens.standardIdTokenParsed);
      expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
        key: tokens.standardIdTokenParsed
      }));
    });

    it('throws an error when attempting to add a non-token', function() {
      var client = setupSync();
      try {
        client.tokenManager.add('key', [
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

  describe('localStorage tokenManager', function() {

    function localStorageSetup() {
      return setupSync({
        type: 'localStorage'
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        var client = localStorageSetup();
        client.tokenManager.add('key', tokens.standardIdTokenParsed);
        expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
          key: tokens.standardIdTokenParsed
        }));
      });
    });

    describe('get', function() {
      it('gets a token', function() {
        var client = localStorageSetup();
        localStorage.setItem('okta-token-storage', JSON.stringify({
          key: tokens.standardIdTokenParsed
        }));
        var result = client.tokenManager.get('key');
        expect(result).toEqual(tokens.standardIdTokenParsed);
      });
    });

    describe('remove', function() {
      it('remove a token', function() {
        var client = localStorageSetup();
        localStorage.setItem('okta-token-storage', JSON.stringify({
          key: tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.remove('key');
        expect(localStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
          anotherKey: tokens.standardIdTokenParsed
        }));
      });
    });
  });

  describe('sessionStorage tokenManager', function() {

    function sessionStorageSetup() {
      return setupSync({
        type: 'sessionStorage'
      });
    }

    describe('add', function() {
      it('adds a token', function() {
        var client = sessionStorageSetup();
        client.tokenManager.add('key', tokens.standardIdTokenParsed);
        expect(sessionStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
          key: tokens.standardIdTokenParsed
        }));
      });
    });

    describe('get', function() {
      it('gets a token', function() {
        var client = sessionStorageSetup();
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          key: tokens.standardIdTokenParsed
        }));
        var result = client.tokenManager.get('key');
        expect(result).toEqual(tokens.standardIdTokenParsed);
      });
    });

    describe('remove', function() {
      it('remove a token', function() {
        var client = sessionStorageSetup();
        sessionStorage.setItem('okta-token-storage', JSON.stringify({
          key: tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }));
        client.tokenManager.remove('key');
        expect(sessionStorage.getItem('okta-token-storage')).toEqual(JSON.stringify({
          anotherKey: tokens.standardIdTokenParsed
        }));
      });
    });
  });


  describe('cookie tokenManager', function() {

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
        client.tokenManager.add('key', tokens.standardIdTokenParsed);
        expect(setCookieMock).toHaveBeenCalledWith('okta-token-storage=' + JSON.stringify({
          key: tokens.standardIdTokenParsed
        }) + '; expires=Tue, 19 Jan 2038 03:14:07 GMT;');
      });
    });

    describe('get', function() {
      it('gets a token', function() {
        var client = cookieStorageSetup();
        util.mockGetCookie('okta-token-storage=' + JSON.stringify({
          key: tokens.standardIdTokenParsed
        }) + ';');
        var result = client.tokenManager.get('key');
        expect(result).toEqual(tokens.standardIdTokenParsed);
      });
    });

    describe('remove', function() {
      it('remove a token', function() {
        var client = cookieStorageSetup();
        util.mockGetCookie('okta-token-storage=' + JSON.stringify({
          key: tokens.standardIdTokenParsed,
          anotherKey: tokens.standardIdTokenParsed
        }) + ';');
        var setCookieMock = util.mockSetCookie();
        client.tokenManager.remove('key');
        expect(setCookieMock).toHaveBeenCalledWith('okta-token-storage=' + JSON.stringify({
          anotherKey: tokens.standardIdTokenParsed
        }) + '; expires=Tue, 19 Jan 2038 03:14:07 GMT;');
      });
    });
  });
});
