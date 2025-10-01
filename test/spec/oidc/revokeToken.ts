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


/* global btoa */
jest.mock('../../../lib/http', () => {
  const actual = jest.requireActual('../../../lib/http');
  return {
    httpRequest: actual.httpRequest,
    post: actual.post,
    setRequestHeader: actual.setRequestHeader
  };
});

const mocked = {
  http: require('../../../lib/http')
};

import { OktaAuth, AccessToken } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}

function createAccessToken(strValue): AccessToken {
  return {
    accessToken: strValue,
    userinfoUrl: '',
    authorizeUrl: '',
    tokenType: 'accessToken',
    expiresAt: 0,
    scopes: []
  };
}

describe('token.revoke', function() {
  it('throws if token is not passed', function() {
    var oa = setupSync();
    return oa.token.revoke(undefined as unknown as AccessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access or refresh token object is required');
      });
  });
  it('throws if invalid token is passed', function() {
    var oa = setupSync();
    var accessToken: unknown = { foo: 'bar' };
    return oa.token.revoke(accessToken as AccessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access or refresh token object is required');
      });
  });
  it('throws if clientId is not set', function() {
    var oa = setupSync();
    var accessToken = createAccessToken('fake');
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A clientId must be specified in the OktaAuth constructor to revoke a token');
      });
  });
  it('makes a POST to /v1/revoke', function() {
    spyOn(mocked.http, 'post').and.returnValue(Promise.resolve());
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = createAccessToken('fake/ &token');
    return oa.token.revoke(accessToken)
      .then(function() {
        expect(mocked.http.post).toHaveBeenCalledWith(oa, 
          'http://example.okta.com/oauth2/v1/revoke', 
          'token_type_hint=access_token&token=fake%2F%20%26token', {
            headers: {
              'Authorization': 'Basic ' + btoa(clientId),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
      });
  });
  it('will throw if http.post rejects', function() {
    var testError = new Error('test error');
    spyOn(mocked.http, 'post').and.callFake(function() {
      return Promise.reject(testError);
    });
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = createAccessToken('fake/ &token');
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        expect(err).toBe(testError);
      });
  });
});
