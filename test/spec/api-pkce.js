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


import { DEFAULT_CODE_CHALLENGE_METHOD, OktaAuth } from '@okta/okta-auth-js';
import { pkce } from '../../lib/oidc';

describe('pkce API', function() {
  let oktaAuth;
  beforeEach(() => {
    oktaAuth = new OktaAuth({
      issuer: 'http://fakey'
    });
  });

  describe('DEFAULT_CODE_CHALLENGE_METHOD', () => {
    it('has DEFAULT_CODE_CHALLENGE_METHOD defined', () => {
      expect(oktaAuth.pkce.DEFAULT_CODE_CHALLENGE_METHOD).toBe(DEFAULT_CODE_CHALLENGE_METHOD);
    });
  });
  describe('generateVerifier', () => {
    it('method exists and calls pkce.generateVerifier', () => {
      expect(typeof oktaAuth.pkce.generateVerifier).toBe('function');
      expect(oktaAuth.pkce.generateVerifier).toBe(pkce.generateVerifier);
    });
  });

  describe('computeChallenge', function() {
    it('method exists and calls pkce.computeChallenge', async () => {
      expect(typeof oktaAuth.pkce.computeChallenge).toBe('function');
      expect(oktaAuth.pkce.computeChallenge).toBe(pkce.computeChallenge);
    });
  });
});