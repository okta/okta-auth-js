jest.mock('cross-fetch');

import util from '@okta/test.support/util';
import _ from 'lodash';
import packageJson from '../../package.json';

describe('General Methods', function () {
  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      title: 'returns empty state if called',
      setup: {
        status: 'password-expired',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd'
          }
        },
        response: 'cancel'
      },
      execute: function (test) {
        return test.trans.cancel()
          .then(function(trans) {
            expect(trans.status).toBeUndefined();
            return trans;
          });
      }
    });
  });

  describe('options.transformErrorXHR', function () {
    util.itErrorsCorrectly({
      title: 'transforms the error response',
      setup: {
        transformErrorXHR: function(res) {
          expect(res).toBeDefined();
          res.responseJSON.errorSummary = 'transformed!!!';
          return res;
        },
        request: {
          uri: '/api/v1/authn',
          data: {}
        },
        response: 'primary-auth-error'
      },
      execute: function (test) {
        return test.oa.signIn({username: 'fake', password: 'fake'})
          .catch(function(err) {
            expect(err.errorCode).toEqual('E0000004');
            expect(err.errorSummary).toEqual('Authentication failed');
            expect(err.errorLink).toEqual('E0000004');
            expect(err.errorId).toEqual('oae89lazz1zRcOcZFpclPsVHA');
            expect(err.errorCauses).toEqual([]);
            expect(err.xhr.responseJSON.errorSummary).toEqual('transformed!!!');
            throw err;
          });
      }
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
            'X-Okta-User-Agent-Extended': 'custom okta-auth-js/' + packageJson.version
          }
        },
        response: 'session'
      },
      execute: function (test) {
        test.oa.userAgent = 'custom ' + test.oa.userAgent;
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
            'X-Okta-User-Agent-Extended': 'okta-auth-js/' + packageJson.version
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
