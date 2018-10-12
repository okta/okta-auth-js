var util = require('../util/util');

describe('PASSWORD_RESET', function () {
  describe('trans.resetPassword', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-reset',
        request: {
          uri: '/api/v1/authn/credentials/reset_password',
          data: {
            stateToken: '00Ehr_AX8eU6E0LTLaa1uCWUmM2cMUa-2WVNxfnyyg',
            newPassword: 'dummypassword'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.resetPassword({
          newPassword: 'dummypassword'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the password doesn\'t meet the complexity requirements (403)',
      setup: {
        status: 'password-reset',
        request: {
          uri: '/api/v1/authn/credentials/reset_password',
          data: {
            stateToken: '00Ehr_AX8eU6E0LTLaa1uCWUmM2cMUa-2WVNxfnyyg',
            newPassword: 'invalid'
          }
        },
        response: 'error-password-requirements'
      },
      execute: function(test) {
        return test.trans.resetPassword({
          newPassword: 'invalid'
        });
      }
    });

  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-reset',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00Ehr_AX8eU6E0LTLaa1uCWUmM2cMUa-2WVNxfnyyg'
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
