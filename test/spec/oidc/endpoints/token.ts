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

jest.mock('../../../../lib/http', () => {
  const actual = jest.requireActual('../../../../lib/http');
  return {
    httpRequest: actual.httpRequest,
    post: actual.post,
    setRequestHeader: actual.setRequestHeader
  };
});

const mocked = {
  http: require('../../../../lib/http')
};

import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import { postToTokenEndpoint } from '../../../../lib/oidc/endpoints/token';
import factory from '@okta/test.support/factory';
import { CustomUrls } from '../../../../lib/oidc/types';

describe('token endpoint', function() {
  var ISSUER = 'http://example.okta.com';
  var REDIRECT_URI = 'http://fake.local';
  var CLIENT_ID = 'fake';
  var endpoint = '/oauth2/v1/token';
  var codeVerifier = 'superfake';
  var authorizationCode = 'notreal';

  util.itMakesCorrectRequestResponse({
    title: 'requests a token',
    setup: {
      issuer: ISSUER,
      bypassCrypto: true,
      calls: [
        {
          request: {
            method: 'post',
            uri: endpoint,
            withCredentials: false,
            data: {
              client_id: CLIENT_ID,
              grant_type: 'authorization_code',
              redirect_uri: REDIRECT_URI
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Okta-User-Agent-Extended': global['USER_AGENT']
            }
          },
          response: 'pkce-token-success',
          responseVars: {
            scope: 'also fake',
            accessToken: 'fake access token',
            idToken: factory.buildIDToken({
              issuer: ISSUER,
              clientId: CLIENT_ID
            })
          }
        }
      ]
    },
    execute: function (test) {
      return postToTokenEndpoint(test.oa, {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      }, {
        tokenUrl: ISSUER + endpoint
      });
    }
  });
});