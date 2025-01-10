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

/* global document */

jest.mock('lib/util', () => {
  const actual = jest.requireActual('../../../lib/util');
  return {
    ...actual,
    delay: () => { return Promise.resolve(); }
  };
});

jest.mock('lib/http', () => {
  const actual = jest.requireActual('../../../lib/http');
  return {
    ...actual,
    post: actual.post
  };
});

jest.mock('lib/features', () => {
  const actual = jest.requireActual('../../../lib/features');
  return {
    ...actual,
    isMobileSafari18: () => false
  };
});
import OktaAuth from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import { setImmediate } from 'timers';

const mocked = {
  http: require('../../../lib/http'),
  util: require('../../../lib/util'),
  features: require('../../../lib/features')
};

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
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?rememberDevice=false',
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

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush true',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true',
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
          autoPush: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush as false',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=false',
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
          autoPush: false
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush as a function',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true',
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
          autoPush: function () {
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification when autoPush function returns truthy value',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true',
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
          autoPush: function () {
            return 'test';
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification when autoPush function returns falsy value',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=false',
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
          autoPush: function () {
            return '';
          }
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'throws an error when autoPush function throws an error',
      setup: {
        status: 'mfa-challenge-sms'
      },
      execute: function (test) {
        return test.trans.verify({
          passCode: '123456',
          autoPush: function () {
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
      title: 'allows verification with autoPush as undefined',
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
          autoPush: undefined
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush as null',
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
          autoPush: null
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with rememberDevice as a function',
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
          rememberDevice: function () {
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification when rememberDevice function returns truthy value',
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
          rememberDevice: function () {
            return 'test';
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification when rememberDevice function returns falsy value',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?rememberDevice=false',
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
          rememberDevice: function () {
            return '';
          }
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'throws an error when rememberDevice function throws an error',
      setup: {
        status: 'mfa-challenge-sms'
      },
      execute: function (test) {
        return test.trans.verify({
          passCode: '123456',
          rememberDevice: function () {
            throw new Error('test');
          }
        });
      },
      expectations: function (test, err) {
        expect(err.name).toEqual('AuthSdkError');
        expect(err.errorSummary).toEqual('RememberDevice resulted in an error.');
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush and rememberDevice true',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=true&rememberDevice=true',
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
          autoPush: true,
          rememberDevice: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush and rememberDevice false',
      setup: {
        status: 'mfa-challenge-sms',
        request: {
          uri: '/api/v1/authn/factors/smsigwDlH85L9FyQK0g3/verify?autoPush=false&rememberDevice=false',
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
          autoPush: false,
          rememberDevice: false
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush undefined and rememberDevice true',
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
          autoPush: undefined,
          rememberDevice: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows verification with autoPush null and rememberDevice true',
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
          autoPush: null,
          rememberDevice: true
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
      title: 'allows polling for push with rememberDevice true',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with rememberDevice false',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: false
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with autoPush true',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with autoPush false',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: false
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with autoPush as a function',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: function () {
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with autoPush value changing during poll',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        var count = 1;
        return test.trans.poll({
          delay: 0,
          autoPush: function () {
            if(count === 3) {
              return false;
            }
            count ++;
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push when autoPush function returns truthy value',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: function () {
            return 'test';
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push when autoPush function returns falsy value',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: function () {
            return '';
          }
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'throws an error when autoPush function throws an error during polling',
      setup: {
        status: 'mfa-challenge-push'
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: function () {
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
      title: 'allows polling for push with rememberDevice as a function',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: function () {
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with rememberDevice value changing during poll',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        var count = 1;
        return test.trans.poll({
          delay: 0,
          rememberDevice: function () {
            if(count === 3) {
              return false;
            }
            count ++;
            return true;
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push when rememberDevice function returns truthy value',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: function () {
            return 'test';
          }
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push when rememberDevice function returns falsy value',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: function () {
            return '';
          }
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'throws an error when rememberDevice function throws an error during polling',
      setup: {
        status: 'mfa-challenge-push'
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          rememberDevice: function () {
            throw new Error('test');
          }
        });
      },
      expectations: function (test, err) {
        expect(err.name).toEqual('AuthSdkError');
        expect(err.errorSummary).toEqual('RememberDevice resulted in an error.');
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'does not include autoPush for polling for push if autoPush undefined',
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
        return test.trans.poll({
          delay: 0,
          autoPush: undefined
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'does not include autoPush for polling for push if autoPush null',
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
        return test.trans.poll({
          delay: 0,
          autoPush: null
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with autoPush and rememberDevice',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=true',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: true,
          rememberDevice: true
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push if rememberDevice is falsy',
      setup: {
        status: 'mfa-challenge-push',
        calls: [
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'mfa-challenge-push'
          },
          {
            request: {
              uri: '/api/v1/authn/factors/opf492vmb3s1blLTs0h7/verify?autoPush=true&rememberDevice=false',
              data: {
                stateToken: '00T4jcVNRzJy5dkWJ4P7c9051dY3FUYY9O2zvbU_vI'
              }
            },
            response: 'success'
          }
        ]
      },
      execute: function (test) {
        return test.trans.poll({
          delay: 0,
          autoPush: true,
          rememberDevice: false
        });
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
        return test.trans.poll(0);
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'allows polling for push with transactionCallBack',
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
        test.transactionCallbackFn = jasmine.createSpy('spy');
        return test.trans.poll({
          delay: 0, 
          transactionCallBack: test.transactionCallbackFn
        });
      },
      expectations: function (test) {
        expect(test.transactionCallbackFn.calls.count()).toBe(2);
        expect(test.transactionCallbackFn.calls.argsFor(0)[0]).toMatchSnapshot();
      },
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

    // OKTA-823470: iOS18 polling issue
    // NOTE: only run these tests in browser environments
    // eslint-disable-next-line no-extra-boolean-cast
    (!!global.document ? describe : describe.skip)('iOS18 polling', () => {
      const togglePageVisibility = () => {
        document.hidden = !document.hidden;
        document.dispatchEvent(new Event('visibilitychange'));
      };

      // see https://stackoverflow.com/a/52196951 for more info about jest/promises/timers
      const advanceTestTimers = async () => {
        jest.runOnlyPendingTimers();
        // flushes promise queue
        return new Promise(resolve => setImmediate(resolve));
      };

      const context = {};

      beforeEach(async () => {
        jest.useFakeTimers();
        document.hidden = false;

        // delay must be mocked (essentially to original implementation) because other tests
        // mock this function to remove any timer delays
        jest.spyOn(mocked.util, 'delay').mockImplementation((ms) => {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        });

        // mocks iOS environment
        jest.spyOn(mocked.features, 'isMobileSafari18').mockReturnValue(true);

        const { response: mfaPush } = await util.generateXHRPair({
          uri: 'https://auth-js-test.okta.com'
        }, 'mfa-challenge-push', 'https://auth-js-test.okta.com');

        const { response: success } = await util.generateXHRPair({
          uri: 'https://auth-js-test.okta.com'
        }, 'success', 'https://auth-js-test.okta.com');

        // mocks flow of wait, wait, wait, success
        context.httpSpy = jest.fn()
          .mockResolvedValueOnce({responseText: JSON.stringify(mfaPush.response)})
          .mockResolvedValueOnce({responseText: JSON.stringify(mfaPush.response)})
          .mockResolvedValueOnce({responseText: JSON.stringify(mfaPush.response)})
          .mockResolvedValueOnce({responseText: JSON.stringify(success.response)});

        const oktaAuth = new OktaAuth({
          issuer: 'https://auth-js-test.okta.com',
          httpRequestClient: context.httpSpy
        });

        context.transaction = oktaAuth.tx.createTransaction(mfaPush.response);
      });

      afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
      });

      it('should proceed with flow as normal if document is never hidden', async () => {
        const { httpSpy, transaction } = context;
        expect(document.hidden).toBe(false);

        let count = 0;
        const pollPromise = transaction.poll({
          delay: 2000,
          transactionCallBack: () => {
            count += 1;
          }
        });

        for (let i=0; i<4; i++) {
          await advanceTestTimers();
        }

        const result = await pollPromise;

        expect(count).toEqual(3);
        expect(httpSpy).toHaveBeenCalledTimes(4);
        expect(result.status).toEqual('SUCCESS');
      });

      it('should not proceed with flow if document is hidden', async () => {
        const { httpSpy, transaction } = context;
        expect(document.hidden).toBe(false);

        togglePageVisibility();

        let count = 0;
        const pollPromise = transaction.poll({
          delay: 2000,
          transactionCallBack: () => {
            count += 1;
          }
        });

        // advance the timers so the flow would have succeed in normal circumstances
        for (let i=0; i<4; i++) {
          await advanceTestTimers();
        }

        // ensure flow did not advance, awaits document focus to return 
        expect(count).toEqual(0);

        togglePageVisibility();
        for (let i=0; i<4; i++) {
          await advanceTestTimers();
        }

        const result = await pollPromise;

        expect(count).toEqual(3);
        expect(httpSpy).toHaveBeenCalledTimes(4);
        expect(result.status).toEqual('SUCCESS');
      });

      it('should pause flow is document is hidden amidst polling', async () => {
        const { httpSpy, transaction } = context;
        expect(document.hidden).toBe(false);

        let count = 0;
        const pollPromise = transaction.poll({
          delay: 2000,
          transactionCallBack: () => {
            count += 1;
          }
        });

        // advance the timers so the flow would have succeed in normal circumstances
        for (let i=0; i<4; i++) {
          await advanceTestTimers();
          if (i == 1) {
            // hide document in middle of flow
            togglePageVisibility();
          }
        }

        // ensure flow pauses, awaits document focus to return 
        expect(count).toEqual(2);

        togglePageVisibility();
        for (let i=0; i<2; i++) {
          await advanceTestTimers();
        }

        const result = await pollPromise;

        expect(count).toEqual(3);
        expect(httpSpy).toHaveBeenCalledTimes(4);
        expect(result.status).toEqual('SUCCESS');
      });

      it('should handle document visibility being toggled consistently', async () => {
        const { httpSpy, transaction } = context;
        expect(document.hidden).toBe(false);

        let count = 0;
        const pollPromise = transaction.poll({
          delay: 2000,
          transactionCallBack: () => {
            count += 1;
          }
        });

        for (let i=0; i<8; i++) {
          if (i % 2 === 0) {
            expect(document.hidden).toBe(false);
          }
          else {
            expect(document.hidden).toBe(true);
          }

          await advanceTestTimers();
          togglePageVisibility();

          if (i % 2 === 0) {
            expect(document.hidden).toBe(true);
          }
          else {
            expect(document.hidden).toBe(false);
          }
        }

        expect(document.hidden).toBe(false);

        const result = await pollPromise;

        expect(count).toEqual(3);
        expect(httpSpy).toHaveBeenCalledTimes(4);
        expect(result.status).toEqual('SUCCESS');
      });
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
