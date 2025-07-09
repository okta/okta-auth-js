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


import util from '@okta/test.support/util';

describe('RECOVERY', function () {
  describe('trans.verifyRecoveryToken', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery', // make sure this stateToken isn't passed
        request: {
          uri: '/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
            relayState: '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.oa.verifyRecoveryToken({
          recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
          relayState: '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'it passes `multiOptionalFactorEnroll` flag when provided',
      setup: {
        status: 'recovery', // make sure this stateToken isn't passed
        request: {
          uri: '/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
            options: { multiOptionalFactorEnroll: true }
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.oa.verifyRecoveryToken({
          recoveryToken: 'VBQ0gwBp5LyJJFdbmWCM',
          multiOptionalFactorEnroll: true
        });
      },
      expectations: function () {
        const recoveryRequest = fetch.mock.calls[1];
        expect(recoveryRequest).toBeDefined();
        expect(recoveryRequest[0]).toEqual('https://auth-js-test.okta.com/api/v1/authn/recovery/token');
        expect(recoveryRequest[1].body).toBeDefined();
        const parsedBody = JSON.parse(recoveryRequest[1].body);
        expect(parsedBody).toBeDefined();
        expect(parsedBody.recoveryToken).toEqual('VBQ0gwBp5LyJJFdbmWCM');
        expect(parsedBody.options).toEqual({ multiOptionalFactorEnroll: true });
      }
    });

  });

  describe('trans.answer', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/recovery/answer',
          data: {
            answer: 'correctanswer',
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
          }
        },
        response: 'success'
      },
      execute: function (test) {
        return test.trans.answer({
          answer: 'correctanswer'
        });
      }
    });

    util.itErrorsCorrectly({
      title: 'returns correct error if the answer is incorrect (403)',
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/recovery/answer',
          data: {
            answer: 'wronganswer',
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
          }
        },
        response: 'error-wrong-answer'
      },
      execute: function(test) {
        return test.trans.answer({
          answer: 'wronganswer'
        });
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'recovery-token',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00lMJySRYNz3u_rKQrsLvLrzxiARgivP8FB_1gpmVb'
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
