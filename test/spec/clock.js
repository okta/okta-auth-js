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


import SdkClock from '../../lib/clock';

describe('clock', function() {
  describe('create', function() {
    it('returns an instance of SdkClock', function() {
      expect(SdkClock.create() instanceof SdkClock).toBe(true);
    });
  });
  
  describe('SdkClock', function() {
    describe('now', function() {
      it('returns the local time / 1000', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = 0;
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe(fakeDate / 1000);
      });

      it('can have a positive offset', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = 2300;
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe((fakeDate + offset) / 1000);
      });

      it('can have a negative offset', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = -2300;
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe((fakeDate + offset) / 1000);
      });

      it('returns a valid number even if offset is a string', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = '0';
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe(fakeDate / 1000);
      });

      it('returns a valid number even if offset is not set', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = null;
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe(fakeDate / 1000);
      });

      it('will be NaN if offset is NaN', function() {
        var fakeDate = 4200;
        jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
        var offset = 'definitelyNotanumber';
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe(Number.NaN);
      });

    });
  });
});