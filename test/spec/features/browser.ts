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


/* eslint-disable @typescript-eslint/no-explicit-any */
/* global document */
import { OktaAuth } from '@okta/okta-auth-js';

describe('features (browser)', function() {
  let orig: Record<string, unknown> = {};
  beforeEach(() => {
    orig.documentMode = (document as any).documentMode;
  });
  afterEach(() => {
    (document as any).documentMode = orig.documentMode;
  });

  describe('isPopupPostMessageSupported', function() {
    it('can succeed', function() {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(true);
    });
    it('not supported in IE < 10', function() {
      (document as any).documentMode = 9;
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(false);
    });
  });

  describe('isIE11OrLess', function() {
    beforeEach(() => {
      (document as any).documentMode = undefined;
    });
    it('returns false when document doesnot have documentMode', function() {
      expect((document as any).documentMode).toBeUndefined();
      expect(OktaAuth.features.isIE11OrLess()).toBe(false);
    });

    it('returns true documentMode is 11', function() {
      (document as any).documentMode = 11;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 10', function() {
      (document as any).documentMode = 10;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 9', function() {
      (document as any).documentMode = 9;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 8', function() {
      (document as any).documentMode = 8;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });
  });
});
