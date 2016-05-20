define(function(require) {
  var util = require('../util/util');

  describe('MFA_CHALLENGE', function () {

    describe('trans.verify', function () {
      util.itMakesCorrectRequestResponse({
        title: 'allows verification with passCode',
        setup: {
          status: 'mfa-challenge-sms',
          request: {
            uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify',
            data: {
              stateToken: '00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          return test.trans.verify({
            passCode: '123456'
          });
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'allows verification with rememberDevice',
        setup: {
          status: 'mfa-challenge-sms',
          request: {
            uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?rememberDevice=true',
            data: {
              stateToken: '00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          return test.trans.verify({
            passCode: '123456',
            rememberDevice: true
          });
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'allows verification with rememberDevice as false',
        setup: {
          status: 'mfa-challenge-sms',
          request: {
            uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify',
            data: {
              stateToken: '00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF',
              passCode: '123456'
            }
          },
          response: 'success'
        },
        execute: function (test) {
          return test.trans.verify({
            passCode: '123456',
            rememberDevice: false
          });
        }
      });
    });

    describe('trans.poll', function () {
      util.itMakesCorrectRequestResponse({
        title: 'allows polling for push',
        setup: {
          status: 'mfa-challenge-push',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'success'
            }
          ]
        },
        execute: function (test) {
          return test.trans.poll(0);
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'allows polling for push after a network error',
        setup: {
          status: 'mfa-challenge-push',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'success'
            }
          ]
        },
        execute: function (test) {
          util.mockQDelay();
          return test.trans.poll(0);
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'allows polling for push after throttling',
        setup: {
          status: 'mfa-challenge-push',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-throttle'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'success'
            }
          ]
        },
        execute: function (test) {
          util.mockQDelay();
          return test.trans.poll(0);
        }
      });

      util.itErrorsCorrectly({
        title: 'returns correct error if persistent network error',
        setup: {
          status: 'mfa-challenge-push',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'mfa-challenge-push'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            }
          ]
        },
        execute: function (test) {
          util.mockQDelay();
          return test.trans.poll(0);
        },
        expectations: function (test, err) {
          expect(err.name).toEqual('AuthApiError');
          expect(err.xhr.status).toEqual(0);
          expect(err.errorCode).toBeUndefined();
          expect(err.errorSummary).toBeUndefined();
          expect(err.errorLink).toBeUndefined();
          expect(err.errorCode).toBeUndefined();
          expect(err.errorId).toBeUndefined();
          expect(err.errorCauses).toBeUndefined();
        }
      });

      util.itErrorsCorrectly({
        title: 'returns correct number of errors if intermittent network errors',
        setup: {
          status: 'mfa-challenge-push',
          calls: [
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            },
            {
              request: {
                uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify',
                data: {
                  stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
                }
              },
              response: 'error-network'
            }
          ]
        },
        execute: function (test) {
          util.mockQDelay();
          return test.trans.poll(0);
        },
        expectations: function (test, err) {
          expect(err.name).toEqual('AuthApiError');
          expect(err.xhr.status).toEqual(0);
          expect(err.errorCode).toBeUndefined();
          expect(err.errorSummary).toBeUndefined();
          expect(err.errorLink).toBeUndefined();
          expect(err.errorCode).toBeUndefined();
          expect(err.errorId).toBeUndefined();
          expect(err.errorCauses).toBeUndefined();
        }
      });
    });

    describe('trans.prev', function () {
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-challenge-sms',
          request: {
            uri: '/api/v1/authn/previous',
            data: {
              stateToken: '00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF'
            }
          },
          response: 'mfa-required'
        },
        execute: function (test) {
          return test.trans.prev();
        }
      });
    });

    describe('trans.cancel', function () {
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-challenge-sms',
          request: {
            uri: '/api/v1/authn/cancel',
            data: {
              stateToken: '00rt1IY9c6Q3RVc4a2jJPbS2uAtFNWJz_d8A26KTdF'
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
});
