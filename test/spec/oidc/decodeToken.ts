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


import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}


describe('token.decode', function() {

  it('correctly decodes a token', function() {
    var oa = setupSync();
    var decodedToken = oa.token.decode(tokens.unicodeToken);
    expect(decodedToken).toEqual(tokens.unicodeDecoded);
  });

  it('throws an error for a malformed token', function() {
    var oa = setupSync();
    try {
      oa.token.decode('malformedToken');
      // Should never hit this
      expect(true).toBe(false);
    } catch (e) {
      expect((e as AuthSdkError).name).toEqual('AuthSdkError');
      expect((e as AuthSdkError).errorSummary).toBeDefined();
    }
  });
});