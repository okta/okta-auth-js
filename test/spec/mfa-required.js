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
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a query param if true',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=true',
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
            autoPush: true
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a query param if false',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=false',
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
            autoPush: false
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a query param if function returns true',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=true',
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
            'passCode': '123456',
            'autoPush': function() {
              return true;
            }
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a boolean query param if function returns a truthy value',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=true',
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
            'passCode': '123456',
            'autoPush': function() {
              return 'test';
            }
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a boolean query param if function returns a falsy value',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=false',
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
            'passCode': '123456',
            'autoPush': function() {
              return '';
            }
          });
        }
      });
      util.itErrorsCorrectly({
        title: 'throws an error when autoPush function throws an error',
        setup: {
          status: 'mfa-required'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {id: 'uftigiEmYTPOmvqTS0g3'});
          return factor.verify({
            'passCode': '123456',
            'autoPush': function () {
              throw new Error('test');
            }
          });
        },
        expectations: function (test, err) {
          expect(err.name).toEqual('AuthSdkError');
          expect(err.errorSummary).toEqual('AutoPush resulted in an error.');
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'doesn\'t pass autoPush as a query param if undefined',
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
            autoPush: undefined
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'doesn\'t pass autoPush as a query param if null',
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
            autoPush: null
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush and rememberDevice as a query param if true',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=true&rememberDevice=true',
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
            autoPush: true,
            rememberDevice: true
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes autoPush as a query param if autoPush is true and rememberDevice is false',
        setup: {
          status: 'mfa-required',
          request: {
            uri: '/api/v1/authn/factors/uftigiEmYTPOmvqTS0g3/verify?autoPush=true',
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
            autoPush: true,
            rememberDevice: false
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes rememberDevice as a query param if autoPush is undefined and rememberDevice is true',
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
            autoPush: undefined,
            rememberDevice: true
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        title: 'passes rememberDevice as a query param if autoPush is null and rememberDevice is true',
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
            autoPush: null,
            rememberDevice: true
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
      util.itMakesCorrectRequestResponse({
        title: 'allows correct answer after invalid answer with autoPush',
        setup: {
          status: 'mfa-required',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true',
                data: {
                  stateToken: '004KscPNUS2LswGp26qiu4Hetqt_zcgz-PcQhPseVP',
                  passCode: 'invalidanswer'
                }
              },
              response: 'mfa-required-error'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true',
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
            autoPush: true
          })
          .fail(function(err) {
            invalidError = err;
          })
          .then(function() {
            return factor.verify({
              passCode: '123456',
              autoPush: true
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
