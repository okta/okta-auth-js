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

describe('LOCKED_OUT', function () {
  describe('trans.unlock', function () {
    util.itMakesCorrectRequestResponse({
      title: 'passes only username and relayState',
      setup: {
        status: 'locked-out',
        request: {
          uri: '/api/v1/authn/recovery/unlock',
          data: {
            'username': 'isaac@example.org',
            'relayState': '/myapp/some/deep/link/i/want/to/return/to'
          }
        },
        response: 'recovery'
      },
      execute: function (test) {
        return test.trans.unlock({
          'username': 'isaac@example.org',
          'relayState': '/myapp/some/deep/link/i/want/to/return/to'
        });
      }
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'locked-out',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {}
        },
        response: 'cancel'
      },
      execute: function (test) {
        return test.trans.cancel();
      }
    });
  });
});
