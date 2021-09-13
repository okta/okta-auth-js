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
import _ from 'lodash';

describe('MFA_ENROLL', function () {
  describe('factors', function () {
    describe('factor.questions', function () {
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-enroll',
          request: {
            method: 'get',
            uri: '/api/v1/users/00uoy3CXZHSMMJPHYXXP/factors/questions'
          },
          response: 'questions'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'question',
            provider: 'OKTA'
          });
          return factor.questions();
        },
        expectations: function (test, res, resp) {
          expect(test.resReply.status).toEqual(200);
          expect(resp).toEqual(res);
        }
      });
    });

    describe('factor.enroll', function () {
      util.itMakesCorrectRequestResponse({
        title: 'enrolls with updatePhone',
        setup: {
          status: 'mfa-enroll',
          request: {
            uri: '/api/v1/authn/factors?updatePhone=true',
            data: {
              stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD',
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+1-555-415-1337'
              }
            }
          },
          response: 'mfa-enroll-activate-sms'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'sms',
            provider: 'OKTA'
          });
          return factor.enroll({
            profile: {
              phoneNumber: '+1-555-415-1337',
              updatePhone: true
            }
          });
        }
      });
      util.itMakesCorrectRequestResponse({
        setup: {
          status: 'mfa-enroll',
          request: {
            uri: '/api/v1/authn/factors',
            data: {
              stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD',
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+1-555-415-1337'
              }
            }
          },
          response: 'mfa-enroll-activate-sms'
        },
        execute: function (test) {
          var factor = _.find(test.trans.factors, {
            factorType: 'sms',
            provider: 'OKTA'
          });
          return factor.enroll({
            profile: {
              phoneNumber: '+1-555-415-1337'
            }
          });
        }
      });
    });
  });

  describe('trans.cancel', function () {
    util.itMakesCorrectRequestResponse({
      setup: {
        status: 'mfa-enroll',
        request: {
          uri: '/api/v1/authn/cancel',
          data: {
            stateToken: '00Z20ZhXVrmyR3z8R-m77BvknHyckWCy5vNwEA6huD'
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
