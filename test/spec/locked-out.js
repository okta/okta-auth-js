var util = require('../util/util');

describe('LOCKED_OUT', function () {
  describe('trans.unlock', function () {
    util.itMakesCorrectRequestResponse({
      title: 'passes only username and relayState',
      setup: {
        status: 'locked-out',
        request: {
          uri: '/api/v1/authn/recovery/unlock',
          data: {
            'username': 'isaac@example.org',
            'relayState': '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'recovery'
      },
      execute: function (test) {
        return test.trans.unlock({
          'username': 'isaac@example.org',
          'relayState': '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'locked-out',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {}
        },
        response: 'cancel'
      },
      execute: function (test) {
        return test.trans.cancel();
      }
    });
  });
});
