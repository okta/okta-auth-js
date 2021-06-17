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


import tokens from '@okta/test.support/tokens';
import factory from '@okta/test.support/factory';
import * as sdkCrypto from '../../../lib/crypto';

describe('crypto', function() {

  describe('verifyToken', function() {

    it('succeeds with known good token and key', function() {
      var idToken = tokens.standardIdToken;
      var key = tokens.standardKey;
      return sdkCrypto.verifyToken(idToken, key)
      .then(function(res) {
        expect(res).toBe(true);
      });
    });

    it('fails with a bad token', function() {
      var ISSUER = 'http://example.okta.com';
      var CLIENT_ID = 'fake';  
      var idToken = factory.buildIDToken({
        issuer: ISSUER,
        clientId: CLIENT_ID
      });
      var key = tokens.standardKey;
      return sdkCrypto.verifyToken(idToken, key)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });

    it('fails with a bad key', function() {
      var idToken = tokens.standardIdToken;
      var key = Object.assign({}, tokens.standardKey, {
        n: sdkCrypto.stringToBase64Url('bad key value')
      });
      return sdkCrypto.verifyToken(idToken, key)
        .then(function(res) {
          expect(res).toBe(false);
        });
    });
  });
});
