var SdkClock = require('../../lib/clock');

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
        var offset = "0";
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
        var offset = "definitelyNotanumber";
        var clock = new SdkClock(offset);
        expect(clock.now()).toBe(Number.NaN);
      });

    });
  });
})