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

describe('General Methods', function () {
  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      title: 'returns empty state if called',
      setup: {
        status: 'password-expired',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd'
          }
        },
        response: 'cancel'
      },
      execute: function (test) {
        return test.trans.cancel()
          .then(function(trans) {
            expect(trans.status).toBeUndefined();
            return trans;
          });
      }
    });
  });

  describe('options.transformErrorXHR', function () {
    util.itErrorsCorrectly({
      title: 'transforms the error response',
      setup: {
        transformErrorXHR: function(res) {
          expect(res).toBeDefined();
          res.responseJSON.errorSummary = 'transformed!!!';
          return res;
        },
        request: {
          uri: '/api/v1/authn',
          data: {}
        },
        response: 'primary-auth-error'
      },
      execute: function (test) {
        return test.oa.signIn({username: 'fake', password: 'fake'})
          .catch(function(err) {
            expect(err.errorCode).toEqual('E0000004');
            expect(err.errorSummary).toEqual('Authentication failed');
            expect(err.errorLink).toEqual('E0000004');
            expect(err.errorId).toEqual('oae89lazz1zRcOcZFpclPsVHA');
            expect(err.errorCauses).toEqual([]);
            expect(err.xhr.responseJSON.errorSummary).toEqual('transformed!!!');
            throw err;
          });
      }
    });
  });


});
