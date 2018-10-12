var util = require('../util/util');

describe('PASSWORD_WARN', function () {
  describe('trans.changePassword', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'correctold',
            newPassword: 'validpass'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.changePassword({
          oldPassword: 'correctold',
          newPassword: 'validpass'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the old password doesn\'t match (403)',
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'incorrectold',
            newPassword: 'validpass'
          }
        },
        response: 'error-incorrect-old-password'
      },
      execute: function(test) {
        return test.trans.changePassword({
          oldPassword: 'incorrectold',
          newPassword: 'validpass'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the password doesn\'t meet the complexity requirements (403)',
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'correctold',
            newPassword: 'invalidpass'
          }
        },
        response: 'error-password-requirements'
      },
      execute: function(test) {
        return test.trans.changePassword({
          oldPassword: 'correctold',
          newPassword: 'invalidpass'
        });
      }
    });

  });

  describe('trans.skip', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/skip',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.skip();
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s'
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
