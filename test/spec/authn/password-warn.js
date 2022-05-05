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


import util from '@okta/test.support/jest/util';

describe('PASSWORD_WARN', function () {
  describe('trans.changePassword', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'correctold',
            newPassword: 'validpass'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.changePassword({
          oldPassword: 'correctold',
          newPassword: 'validpass'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the old password doesn\'t match (403)',
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'incorrectold',
            newPassword: 'validpass'
          }
        },
        response: 'error-incorrect-old-password'
      },
      execute: function(test) {
        return test.trans.changePassword({
          oldPassword: 'incorrectold',
          newPassword: 'validpass'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the password doesn\'t meet the complexity requirements (403)',
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/credentials/change_password',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s',
            oldPassword: 'correctold',
            newPassword: 'invalidpass'
          }
        },
        response: 'error-password-requirements'
      },
      execute: function(test) {
        return test.trans.changePassword({
          oldPassword: 'correctold',
          newPassword: 'invalidpass'
        });
      }
    });

  });

  describe('trans.skip', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/skip',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.skip();
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'password-warn',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00PrDdGF4JjOG1v2Mh2b2_vJZsywXSwZAuzEVhCk1s'
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
