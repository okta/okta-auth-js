/* globals define, expect */
define(function(require) {
  var util = require('../util/util'),
      _ = require('lodash');

  describe('MFA_REQUIRED', function () {

    describe('factor.verify', function () {
      util.itMakesCorrectRequestResponse({
        title: 'uses answer property for security question',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/ufsigasO4dVUPM5O40g3/verify',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              answer: 'food'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'ufsigasO4dVUPM5O40g3'});
          return factor.verify({
            answer: 'food'
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'converts answer to passCode for other factorTypes',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'uftigiEmYTPOmvqTS0g3'});
          return factor.verify({
            passCode: '123456'
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'returns MFA_CHALLENGE if factorType returns it',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              passCode: ''
            }
          },
          response: 'mfa-challenge-sms'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'smsigwDlH85L9FyQK0g3'});
          return factor.verify({
            passCode: ''
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes rememberDevice as a query param if specified',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?rememberDevice=true',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'uftigiEmYTPOmvqTS0g3'});
          return factor.verify({
            passCode: '123456',
            rememberDevice: true
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'doesn\'t pass rememberDevice as a query param if falsy',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'uftigiEmYTPOmvqTS0g3'});
          return factor.verify({
            passCode: '123456',
            rememberDevice: false
          });
        }
      });
      util.itErrorsCorrectly({
        title: 'returns correct error when invalid answer provided (403)',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
              passCode: 'invalidanswer'
            }
          },
          response: 'mfa-required-error'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'smsigwDlH85L9FyQK0g3'});
          return factor.verify({
            passCode: 'invalidanswer'
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'allows correct answer after invalid answer with rememberDevice',
        setup: {
          status: 'mfa-required',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?rememberDevice=true',
                data: {
                  stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
                  passCode: 'invalidanswer'
                }
              },
              response: 'mfa-required-error'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?rememberDevice=true',
                data: {
                  stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
                  passCode: '123456'
                }
              },
              response: 'success'
            }
          ]
        },
        execute: function (test) {
          var invalidError;
          var factor = _.find(test.trans.factors, {id: 'smsigwDlH85L9FyQK0g3'});
          return factor.verify({
            passCode: 'invalidanswer',
            rememberDevice: true
          })
          .fail(function(err) {
            invalidError = err;
          })
          .then(function() {
            return factor.verify({
              passCode: '123456',
              rememberDevice: true
            });
          })
          .fin(function() {
            expect(invalidError).not.toBeUndefined();
          });
        }
      });
    });

    describe('trans.cancel', function () {
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/cancel',
            data: {
              stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP'
            }
          },
          response: 'cancel'
        },
        execute: function (test) {
          return test.trans.cancel();
        }
      });

      // Add this test when we have this functionality
      xit('deletes stateToken cookie when cancel is called');
    });

  });
});
