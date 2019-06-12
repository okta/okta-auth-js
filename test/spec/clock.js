var clock = require('../../lib/clock');

describe('clock', function() {

  describe('getLocalAdjustedTime', function() {
    it('returns the local time / 1000', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var sdk = {
        options: {
          localClockOffset: 0
        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe(fakeDate / 1000);
    });

    it('can have a positive offset', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var offset = 2300;
      var sdk = {
        options: {
          localClockOffset: offset
        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe((fakeDate + offset) / 1000);
    });

    it('can have a negative offset', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var offset = -2300;
      var sdk = {
        options: {
          localClockOffset: offset
        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe((fakeDate + offset) / 1000);
    });

    it('returns a valid number even if offset is a string', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var sdk = {
        options: {
          localClockOffset: "0"
        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe(fakeDate / 1000);
    });


    it('returns a valid number even if offset is not set', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var sdk = {
        options: {

        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe(fakeDate / 1000);
    });


    it('will be NaN if offset is NaN', function() {
      var fakeDate = 4200;
      jest.spyOn(Date, 'now').mockReturnValue(fakeDate);
      var sdk = {
        options: {
          localClockOffset: "definitelyNotanumber"
        }
      };
      expect(clock.getLocalAdjustedTime(sdk)).toBe(Number.NaN);
    });

  });
})