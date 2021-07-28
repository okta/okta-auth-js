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


/* global window, USER_AGENT */

import {
  closeSession,
  sessionExists,
  getSession,
  refreshSession,
  setCookieAndRedirect
} from '../../lib/session';
import http from '../../lib/http';
import util from '@okta/test.support/util';
import _ from 'lodash';

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
      return sessionExists(sdk)
        .then(function() {
          expect(sdk.session.get).toHaveBeenCalled();
        });
    });

    it('resolves to false by default', function() {
      return sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('resolves to false if session.get throws', function() {
      sdk.session.get.mockImplementation(function() {
        return Promise.reject(new Error('test error'));
      });
      return sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('resolves to true if status = "ACTIVE"', function() {
      sessionObj = {
        status: 'ACTIVE'
      };
      return sessionExists(sdk)
        .then(function(res) {
          expect(res).toBe(true);
        });
    });
  });

  describe('getSession', function() {
    it('Hits endpoint: /api/v1/sessions/me', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return getSession(sdk)
        .then(function() {
          expect(http.get).toHaveBeenCalledWith(sdk, '/api/v1/sessions/me', { withCredentials: true });
        });
    });

    it('XHR error: returns an INACTIVE session object', function() {
      jest.spyOn(http, 'get').mockImplementation(function() {
        return Promise.reject(new Error('test error'));
      });
      return getSession(sdk)
        .then(function(res) {
          expect(res).toEqual({
            status: 'INACTIVE'
          });
        });
    });

    it('Adds a "refresh" method on the session object', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return getSession(sdk)
        .then(function(res) {
          expect(typeof res.refresh).toBe('function');
        });
    });

    it('Adds a "user" method on the session object', function() {
      jest.spyOn(http, 'get').mockReturnValue(Promise.resolve());
      return getSession(sdk)
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
      return getSession(sdk)
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
      return getSession(sdk)
        .then(function(res) {
          res.refresh();
          expect(http.post).toHaveBeenCalledWith(sdk, href, {}, { withCredentials: true });
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
      return getSession(sdk)
        .then(function(res) {
          http.get.mockReset();
          jest.spyOn(http, 'get').mockReturnValue(null);
          res.user();
          expect(http.get).toHaveBeenCalledWith(sdk, href, { withCredentials: true });
        });
    });
  });

  describe('closeSession', function() {
    it('makes a DELETE request to /api/v1/sessions/me', function() {
      jest.spyOn(http, 'httpRequest').mockReturnValue(Promise.resolve());
      return closeSession(sdk)
        .then(function() {
          expect(http.httpRequest).toHaveBeenCalledWith(sdk, {
            url: baseUrl + '/api/v1/sessions/me',
            method: 'DELETE',
            withCredentials: true
          });
        });
    });

    it('will throw if http request rejects', function() {
      var testError = new Error('test error');
      jest.spyOn(http, 'httpRequest').mockReturnValue(Promise.reject(testError));
      return closeSession(sdk) // should throw
        .catch(function(e) {
          expect(e).toBe(testError);
        });
    });
  });

  describe('refreshSession', function() {
    it('makes a POST to /api/v1/sessions/me/lifecycle/refresh', function() {
      jest.spyOn(http, 'post').mockReturnValue(Promise.resolve());
      return refreshSession(sdk)
        .then(function() {
          expect(http.post).toHaveBeenCalledWith(sdk,'/api/v1/sessions/me/lifecycle/refresh', {}, { withCredentials: true });
        });
    });
    it('can throw', function() {
      var testError = new Error('test error');
      jest.spyOn(http, 'post').mockReturnValue(Promise.reject(testError));
      return refreshSession(sdk)
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
      window.location = {
        href: currentUrl,
        assign: jest.fn()
      };
    });
    it('redirects to /login/sessionCookieRedirect', function() {
      setCookieAndRedirect(sdk);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&redirectUrl=' + encodeURIComponent(currentUrl));
    });
    it('can pass a sessionToken', function() {
      var sessionToken = 'blah-blah';
      setCookieAndRedirect(sdk, sessionToken);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=' +
        encodeURIComponent(sessionToken) + '&redirectUrl=' + encodeURIComponent(currentUrl));
    });
    it('can pass a redirectUrl', function() {
      var sessionToken = 'blah-blah';
      var redirectUrl = 'http://go-here-now';
      setCookieAndRedirect(sdk, sessionToken, redirectUrl);
      expect(window.location.assign).toHaveBeenCalledWith(baseUrl + '/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=' +
        encodeURIComponent(sessionToken) + '&redirectUrl=' + encodeURIComponent(redirectUrl));
    });
  });

  describe('session.close', function () {
    util.itMakesCorrectRequestResponse({
      title: 'allows deleting a session',
      setup: {
        calls: [
          {
            request: {
              uri: '/api/v1/sessions/me'
            },
            response: 'empty'
          }
        ]
      },
      execute: function (test) {
        return test.oa.session.close();
      },
      expectations: function () {
        // Assertions of the correct uri and response handling
        // are implicitly expected when the test runs
      }
    });
  });

  describe('session.get', function () {
    util.itMakesCorrectRequestResponse({
      title: 'return ACTIVE session with refresh method on success',
      setup: {
        calls: [
          {
            request: {
              uri: '/api/v1/sessions/me'
            },
            response: 'session'
          }
        ]
      },
      execute: function (test) {
        return test.oa.session.get();
      },
      expectations: function (test, res) {
        expect(res.refresh).toBeDefined();
        expect(res.user).toBeDefined();
        expect(_.omit(res, 'refresh', 'user')).toEqual({
          'id': '000SFn2Do5LSEeE7ETg1JewvQ',
          'userId': '00uih5GNExguYaK6I0g3',
          'login': 'administrator1@clouditude.net',
          'expiresAt': '2016-01-27T03:59:35.000Z',
          'status': 'ACTIVE',
          'lastPasswordVerification': '2016-01-27T01:15:39.000Z',
          'lastFactorVerification': null,
          'amr': ['pwd'],
          'idp': {
            'id': '00oigpTeBgc5cgQh50g3',
            'type': 'OKTA'
          },
          'mfaActive': false
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'returns INACTIVE on failure',
      setup: {
        request: {
          uri: '/api/v1/sessions/me'
        },
        response: 'error-session-not-found'
      },
      execute: function (test) {
        return test.oa.session.get();
      },
      expectations: function (test, res) {
        expect(res.status).toEqual('INACTIVE');
      }
    });
  });

  describe('modified user agent', function () {
    util.itMakesCorrectRequestResponse({
      title: 'should be added to requests headers',
      setup: {
        request: {
          uri: '/api/v1/sessions/me',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': `${USER_AGENT} fake/x.y`
          }
        },
        response: 'session'
      },
      execute: function (test) {
        test.oa._oktaUserAgent.addEnvironment('fake/x.y');
        return test.oa.session.get();
      },
      expectations: function () {
        // We validate the headers for each request in our ajaxMock
      }
    });
  });

  describe('custom headers', function () {
    util.itMakesCorrectRequestResponse({
      title: 'adds custom headers',
      setup: {
        headers: {
          'X-Custom-Header': 'custom'
        },
        request: {
          uri: '/api/v1/sessions/me',
          headers: {
            'X-Custom-Header': 'custom',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': USER_AGENT
          }
        },
        response: 'session'
      },
      execute: function (test) {
        return test.oa.session.get();
      },
      expectations: function () {
        // We validate the headers for each request in our ajaxMock
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'override headers',
      setup: {
        headers: {
          'X-Okta-User-Agent-Extended': 'another-sdk-version'
        },
        request: {
          uri: '/api/v1/sessions/me',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'another-sdk-version'
          }
        },
        response: 'session'
      },
      execute: function (test) {
        return test.oa.session.get();
      },
      expectations: function () {
        // We validate the headers for each request in our ajaxMock
      }
    });
  });
});
