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

describe('NO AUTH STATUS', function () {
  describe('signIn', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure a stateToken isn\'t passed',
      setup: {
        request: {
          uri: '/api/v1/authn',
          data: {
            username: 'ausername',
            password: 'apassword'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.oa.signIn({
          username: 'ausername',
          password: 'apassword'
        });
      }
    });
    util.itErrorsCorrectly({
      title: 'returns correct error if auth failed API error (401)',
      setup: {
        request: {
          uri: '/api/v1/authn',
          data: {}
        },
        response: 'primary-auth-error'
      },
      execute: function (test) {
        return test.oa.signIn({username: 'fake', password: 'fake'});
      }
    });
  });

  describe('forgotPassword', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure a stateToken isn\'t passed',
      setup: {
        request: {
          uri: '/api/v1/authn/recovery/password',
          data: {
            username: 'isaac@example.org',
            relayState: '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'recovery-token'
      },
      execute: function (test) {
        return test.oa.forgotPassword({
          username: 'isaac@example.org',
          relayState: '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

  describe('unlockAccount', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure a stateToken isn\'t passed',
      setup: {
        request: {
          uri: '/api/v1/authn/recovery/unlock',
          data: {
            username: 'isaac@example.org',
            relayState: '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'recovery'
      },
      execute: function (test) {
        return test.oa.unlockAccount({
          username: 'isaac@example.org',
          relayState: '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

  describe('verifyRecoveryToken', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        title: 'make sure a stateToken isn\'t passed',
        request: {
          uri: '/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'somerecoverytoken',
            relayState: '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'recovery'
      },
      execute: function (test) {
        return test.oa.verifyRecoveryToken({
          recoveryToken: 'somerecoverytoken',
          relayState: '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

});
