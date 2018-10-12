var util = require('../util/util');

describe('webfinger', function () {
  describe('webfinger response', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure webfinger response is valid',
      setup: {
        calls: [
          {
            request: {
              method: 'get',
              uri: '/.well-known/webfinger?resource=acct%3Ajohn.joe%40example.com' +
              '&requestContext=%2Furl%2Fto%2Fredirect%2Fto'
            },
            response: 'webfinger'
          }
        ]
      },
      execute: function (test) {
        return test.oa.webfinger({
          resource: 'acct:john.joe@example.com',
          requestContext: '/url/to/redirect/to'
        });
      }
    });
  });

});
