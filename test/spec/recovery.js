var util = require('../util/util');

describe('RECOVERY', function () {
  describe('trans.verifyRecoveryToken', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery', // make sure this stateToken isn't passed
        request: {
          uri: '/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
            relayState: '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.oa.verifyRecoveryToken({
          recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
          relayState: '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

  describe('trans.answer', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/recovery/answer',
          data: {
            answer: 'correctanswer',
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.answer({
          answer: 'correctanswer'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the answer is incorrect (403)',
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/recovery/answer',
          data: {
            answer: 'wronganswer',
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
          }
        },
        response: 'error-wrong-answer'
      },
      execute: function(test) {
        return test.trans.answer({
          answer: 'wronganswer'
        });
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
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
