define(function(require) {
  var util = require('../util/util');

  describe('WEBFINGER', function () {

    describe('webfinger response', function () {
      util.itMakesCorrectRequestResponse({
        title: 'make sure webfinger response is valid',
        setup: {
          calls: [
            {
              request: {
                method: 'get',
                uri: '/.well-known/webfinger'
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
});
