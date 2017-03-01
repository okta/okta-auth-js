define(function(require) {
  var util = require('../../lib/util');
  var _ = require('lodash');

  describe('util', function() {
    describe('warn', function() {
      it('writes warning to console', function() {
        spyOn(window.console, 'log');
        util.warn('sample warning');
        expect(window.console.log).toHaveBeenCalledWith('[okta-auth-sdk] WARN: sample warning');
      });
    });

    describe('deprecate', function() {
      it('writes deprecation to console', function() {
        spyOn(window.console, 'log');
        util.deprecate('sample deprecation');
        expect(window.console.log).toHaveBeenCalledWith('[okta-auth-sdk] DEPRECATION: sample deprecation');
      });
    });

    describe('getConsole', function() {
      it('returns actual console', function() {
        expect(util.getConsole()).toBe(window.console);
      });

      it('returns fake console if native console does not exist', function() {
        spyOn(util, 'getNativeConsole').and.returnValue(undefined);
        expect(_.isNative(util.getConsole().log)).toBe(false);
      });
    });
  });
});
