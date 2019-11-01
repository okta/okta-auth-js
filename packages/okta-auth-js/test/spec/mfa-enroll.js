jest.mock('cross-fetch');

var util = require('@okta/test.support/util');
var _ = require('lodash');

describe('MFA_ENROLL', function () {
  describe('factors', function () {
    describe('factor.questions', function () {
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-enroll',
          request: {
            method: 'get',
            uri: '/api/v1/users/00uoy3CXZHSMMJPHYXXP/factors/questions'
          },
          response: 'questions'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'question',
            provider: 'OKTA'
          });
          return factor.questions();
        },
        expectations: function (test, res) {
          expect(test.resReply.status).toEqual(200);
          expect(test.responseBody).toEqual(res);
        }
      });
    });

    describe('factor.enroll', function () {
      util.itMakesCorrectRequestResponse({
        title: 'enrolls with updatePhone',
        setup: {
          status: 'mfa-enroll',
          request: {
            uri: '/api/v1/authn/factors?updatePhone=true',
            data: {
              stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD',
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+1-555-415-1337'
              }
            }
          },
          response: 'mfa-enroll-activate-sms'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'sms',
            provider: 'OKTA'
          });
          return factor.enroll({
            profile: {
              phoneNumber: '+1-555-415-1337',
              updatePhone: true
            }
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-enroll',
          request: {
            uri: '/api/v1/authn/factors',
            data: {
              stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD',
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+1-555-415-1337'
              }
            }
          },
          response: 'mfa-enroll-activate-sms'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'sms',
            provider: 'OKTA'
          });
          return factor.enroll({
            profile: {
              phoneNumber: '+1-555-415-1337'
            }
          });
        }
      });
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'mfa-enroll',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD'
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
