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

  describe('isIOS, isMobileSafari18', () => {
    const iOSAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/92.0.4515.90 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/92.0.4515.90 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/130.0.2849.80 Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/132.0.2957.32 Version/18.0 Mobile/15E148 Safari/604.1',
    ];
    const mobileSafari18Agents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Teak/5.9 Version/18 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
    ];

    for (let userAgent of iOSAgents) {
      it('can succeed for ' + userAgent, () => {
        jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue(userAgent);
        expect(OktaAuth.features.isIOS()).toBe(true);
        expect(OktaAuth.features.isMobileSafari18()).toBe(false);
      });
    }
    for (let userAgent of mobileSafari18Agents) {
      it('can succeed for ' + userAgent, () => {
        jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue(userAgent);
        expect(OktaAuth.features.isIOS()).toBe(true);
        expect(OktaAuth.features.isMobileSafari18()).toBe(true);
      });
    }

    it('returns false if navigator is unavailable', () => {
      jest.spyOn(global, 'navigator', 'get').mockReturnValue(undefined as never);
      expect(OktaAuth.features.isIOS()).toBe(false);
      expect(OktaAuth.features.isMobileSafari18()).toBe(false);
    });

    it('returns false if userAgent is unavailable', () => {
      jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue(undefined as never);
      expect(OktaAuth.features.isIOS()).toBe(false);
      expect(OktaAuth.features.isMobileSafari18()).toBe(false);
    });
  });
});
