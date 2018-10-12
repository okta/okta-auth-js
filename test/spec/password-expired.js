var util = require('../util/util');

describe('PASSWORD_EXPIRED', function () {
  describe('trans.changePassword', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-expired',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd',
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
        status: 'password-expired',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd',
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
        status: 'password-expired',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd',
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

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
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
        return test.trans.cancel();
      }
    });
  });
});
