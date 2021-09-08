/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


jest.mock('../../../lib/util/misc', () => {
  return {
    delay: () => { return Promise.resolve(); }
  };
});
import util from '@okta/test.support/util';

describe('MFA_ENROLL_ACTIVATE', function () {
  describe('trans.poll', function () {
    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push',
      setup: {
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
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
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
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
      title: 'allows polling for push after throttling',
      setup: {
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-throttle'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
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

    util.itErrorsCorrectly({
      title: 'returns correct error if persistent network error',
      setup: {
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          }
        ]
      },
      execute: function (test) {
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
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-waiting'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'error-network'
          }
        ]
      },
      execute: function (test) {
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

  describe('trans.activate', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'mfa-enroll-activate-sms',
        request: {
          uri: '/api/v1/authn/factors/mbl198rKSEWOSKRIVIFT/lifecycle/activate',
          data: {
            stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ',
            passCode: '123456'
          }
        },
        response: 'mfa-enroll'
      },
      execute: function (test) {
        return test.trans.activate({
          passCode: '123456'
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows for activate after TIMEOUT',
      setup: {
        status: 'mfa-enroll-activate-push-waiting',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate/poll',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'mfa-enroll-activate-push-timeout'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opfh52xcuft3J4uZc0g3/lifecycle/activate',
              data: {
                stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll(0)
          .then(function(trans) {
            return trans.activate();
          });
      },
      expectations: function (test, _res, resp) {
        expect(test.trans.data).toEqual(resp);
      }
    });
  });

  describe('trans.prev', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'mfa-enroll-activate-sms',
        request: {
          uri: '/api/v1/authn/previous',
          data: {
            stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
          }
        },
        response: 'mfa-enroll'
      },
      execute: function (test) {
        return test.trans.prev();
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'mfa-enroll-activate-sms',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00lT7DEzQaeP6mv1_y3pdXjNEONzk83mXX-yhgEdVQ'
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
