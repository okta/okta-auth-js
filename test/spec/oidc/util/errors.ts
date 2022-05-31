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


import { OAuthError } from '../../../../lib/errors';
import { isInteractionRequiredError, isRefreshTokenExpiredError } from '../../../../lib/oidc/util';

describe('oidc/util/errors', () => {

  describe('isInteractionRequiredError', () => {
    it('returns true for OAuthError objects with "interaction_required" errorCode', () => {
      const error = new OAuthError('interaction_required', 'description not matter');
      expect(isInteractionRequiredError(error)).toBe(true);
    });

    it('returns false for OAuthError objects with errorCode other than "interaction_required"', () => {
      const error = new OAuthError('something', 'description not matter');
      expect(isInteractionRequiredError(error)).toBe(false);
    });

    it('returns false for non OAuthError objects', () => {
      const error = new Error('something');
      expect(isInteractionRequiredError(error)).toBe(false);
    });
  });

  describe('isRedirectTokenExpiredError', () => {
    it('returns true for OAuthError objects with expected fields', () => {
      const error = new OAuthError('invalid_grant', 'The refresh token is invalid or expired.');
      expect(isRefreshTokenExpiredError(error)).toBe(true);
    });

    it('returns false for OAuthError objects without expected fields', () => {
      const error = new OAuthError('something', 'description not matter');
      expect(isRefreshTokenExpiredError(error)).toBe(false);
    });

    it('returns false for non OAuthError objects', () => {
      const error = new Error('something');
      expect(isRefreshTokenExpiredError(error as unknown)).toBe(false);
    });
  });
});