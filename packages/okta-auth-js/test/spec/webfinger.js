jest.mock('cross-fetch');

var util = require('@okta/test.support/util');

describe('webfinger', function () {
  describe('webfinger response', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure webfinger response is valid',
      setup: {
        calls: [
          {
            request: {
              method: 'get',
              uri: '/.well-known/webfinger?resource=acct%3Ajohn.joe%40example.com'
            },
            response: 'webfinger'
          }
        ]
      },
      execute: function (test) {
        return test.oa.webfinger({
          resource: 'acct:john.joe@example.com'
        });
      }
    });
  });

});
