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

describe('webfinger', function () {
  describe('webfinger response', function () {
    util.itMakesCorrectRequestResponse({
      title: 'make sure webfinger response is valid',
      setup: {
        calls: [
          {
            request: {
              method: 'get',
              uri: '/.well-known/webfinger?resource=acct%3Ajohn.joe%40example.com' +
              '&requestContext=%2Furl%2Fto%2Fredirect%2Fto'
            },
            response: 'webfinger'
          }
        ]
      },
      execute: function (test) {
        return test.oa.webfinger({
          resource: 'acct:john.joe@example.com',
          requestContext: '/url/to/redirect/to'
        });
      }
    });
  });

});
