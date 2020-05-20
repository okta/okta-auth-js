/* global window */
var session = require('../../lib/session');
var http = require('../../lib/http');

describe('session', function() {
  var sdk;
  var sessionObj;
  let originalLocation;
  var baseUrl;

  beforeEach(function() {
    originalLocation = window.location;
    sessionObj = {};
    baseUrl = 'http://fakey';
    
    sdk = {
      getIssuerOrigin: jest.fn().mockReturnValue(baseUrl),
      options: {
        issuer: baseUrl
      },
      session: {
        get: jest.fn().mockImplementation(function() {
          return Promise.resolve(sessionObj);
        })
      }
    };
  });  
  
  afterEach(() => {
    window.location = originalLocation;
  });

  describe('sessionExists', function() {
    it('calls sdk.session.get', function() {
      return session.sessionExists(sdk)
        .then(function() {
          expect(sdk.session.get).toHaveBeenCalled();
        });
    });

    it('resolves to false by default', function() {
      return session.sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('resolves to false if session.get throws', function() {
      sdk.session.get.mockImplementation(function() {
        return Promise.reject(new Error('test error'));
      });
      return session.sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('resolves to true if status = "ACTIVE"', function() {
      sessionObj = {
        status: 'ACTIVE'
      };
      return session.sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(true);
        });
    });
  });

  describe('getSession', function() {
    it('Hits endpoint: /api/v1/sessions/me', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return session.getSession(sdk)
        .then(function() {
          expect(http.get).toHaveBeenCalledWith(sdk, '/api/v1/sessions/me');
        });
    });

    it('XHR error: returns an INACTIVE session object', function() {
      jest.spyOn(http, 'get').mockImplementation(function() {
        return Promise.reject(new Error('test error'));
      });
      return session.getSession(sdk)
        .then(function(res) {
          expect(res).toEqual({
            status: 'INACTIVE'
          });
        });
    });

    it('Adds a "refresh" method on the session object', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return session.getSession(sdk)
        .then(function(res) {
          expect(typeof res.refresh).toBe('function');
        });
    });

    it('Adds a "user" method on the session object', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return session.getSession(sdk)
        .then(function(res) {
          expect(typeof res.user).toBe('function');
        });
    });

    it('Omits the "_links" section from the object', function() {
      var sessionObj = {
        foo: 'bar',
        _links: {
          foo: 'bar'
        }
      };
      jest.spyOn(http, 'get').mockImplementation(function() {
        return Promise.resolve(sessionObj);
      });
      return session.getSession(sdk)
        .then(function(res) {
          expect(res).toEqual({
            foo: 'bar',
            refresh: expect.any(Function),
            user: expect.any(Function)
          });
        });
    });

    it('refresh: posts to the refresh link', function() {
      var href = 'fake-link';
      var sessionObj = {
        _links: {
          refresh: {
            href: href
          }
        }
      };
      jest.spyOn(http, 'post').mockReturnValue(null);
      jest.spyOn(http, 'get').mockImplementation(function() {
        return Promise.resolve(sessionObj);
      });
      return session.getSession(sdk)
        .then(function(res) {
          res.refresh();
          expect(http.post).toHaveBeenCalledWith(sdk, href)
        });
    });

    it('user: gets the user link', function() {
      var href = 'fake-link';
      var sessionObj = {
        _links: {
          user: {
            href: href
          }
        }
      };
      jest.spyOn(http, 'get').mockImplementation(function() {
        return Promise.resolve(sessionObj);
      });
      return session.getSession(sdk)
        .then(function(res) {
          // @ts-ignore
          http.get.mockReset();
          jest.spyOn(http, 'get').mockReturnValue(null);
          res.user();
          expect(http.get).toHaveBeenCalledWith(sdk, href)
        });
    });
  });

  describe('closeSession', function() {
    it('makes a DELETE request to /api/v1/sessions/me', function() {
      jest.spyOn(http, 'httpRequest').mockReturnValue(Promise.resolve());
      return session.closeSession(sdk)
        .then(function() {
          expect(http.httpRequest).toHaveBeenCalledWith(sdk, {
            url: baseUrl + '/api/v1/sessions/me',
            method: 'DELETE'
          });
        });
    });

    it('will throw if http request rejects', function() {
      var testError = new Error('test error');
      jest.spyOn(http, 'httpRequest').mockReturnValue(Promise.reject(testError));
      return session.closeSession(sdk) // should throw
        .catch(function(e) {
          expect(e).toBe(testError);
        });
    });
  });

  describe('refreshSession', function() {
    it('makes a POST to /api/v1/sessions/me/lifecycle/refresh', function() {
      jest.spyOn(http, 'post').mockReturnValue(Promise.resolve());
      return session.refreshSession(sdk)
        .then(function() {
          expect(http.post).toHaveBeenCalledWith(sdk,'/api/v1/sessions/me/lifecycle/refresh');
        });
    });
    it('can throw', function() {
      var testError = new Error('test error');
      jest.spyOn(http, 'post').mockReturnValue(Promise.reject(testError));
      return session.refreshSession(sdk)
        .catch(function(e) {
          expect(e).toBe(testError);
        });
    });
  });

  describe('setCookieAndRedirect', function() {
    var currentUrl;
    beforeEach(function() {
      currentUrl = 'http://i-am-here';
      delete window.location;
      // @ts-ignore
      window.location = {
        href: currentUrl,
        assign: jest.fn()
      };
    });
    it('redirects to /login/sessionCookieRedirect', function() {
      session.setCookieAndRedirect(sdk);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&redirectUrl=' + encodeURIComponent(currentUrl));
    });
    it('can pass a sessionToken', function() {
      var sessionToken = 'blah-blah';
      session.setCookieAndRedirect(sdk, sessionToken);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=' +
        encodeURIComponent(sessionToken) + '&redirectUrl=' + encodeURIComponent(currentUrl));
    });
    it('can pass a redirectUrl', function() {
      var sessionToken = 'blah-blah';
      var redirectUrl = 'http://go-here-now';
      session.setCookieAndRedirect(sdk, sessionToken, redirectUrl);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=' +
        encodeURIComponent(sessionToken) + '&redirectUrl=' + encodeURIComponent(redirectUrl));
    });
  });
});
