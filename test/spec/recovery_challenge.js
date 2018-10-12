var util = require('../util/util');

describe('RECOVERY_CHALLENGE', function () {
  describe('no _links', function () {
    describe('trans.cancel', function () {
      util.itMakesCorrectRequestResponse({
        title: 'resets to empty state transaction',
        setup: {
          request: {
            uri: '/api/v1/authn/recovery/password',
            data: {
              username: 'administrator1',
              factorType: 'EMAIL'
            }
          },
          response: 'recovery-challenge-email'
        },
        execute: function (test) {
          return test.oa.forgotPassword({
              username: 'administrator1',
              factorType: 'EMAIL'
            })
            .then(function(trans) {
              return trans.cancel();
            });
        },
        expectations: function (test, trans) {
          expect(trans.status).toBeUndefined();
        }
      });
    });
  });

  describe('trans.verify', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-challenge-password',
        request: {
          uri: '/api/v1/authn/recovery/factors/SMS/verify',
          data: {
            stateToken: 'testStateToken',
            passCode: '1234'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.verify({
          passCode: '1234'
        });
      }
    });
  });

  describe('trans.resend', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-challenge-password',
        request: {
          uri: '/api/v1/authn/recovery/factors/SMS/resend',
          data: {
            stateToken: 'testStateToken'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.resend();
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-challenge-password',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: 'testStateToken'
          }
        },
        response: 'cancel'
      },
      execute: function (test) {
        return test.trans.cancel();
      }
    });
  });
});
