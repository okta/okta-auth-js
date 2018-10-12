var util = require('../../lib/util');

describe('util', function() {
  beforeEach(function() {
    jest.spyOn(window.console, 'log');
  });

  describe('warn', function() {
    it('writes warning to console', function() {
      util.warn('sample warning');
      expect(window.console.log).toHaveBeenCalledWith('[okta-auth-sdk] WARN: sample warning');
    });
  });

  describe('deprecate', function() {
    it('writes deprecation to console', function() {
      util.deprecate('sample deprecation');
      expect(window.console.log).toHaveBeenCalledWith('[okta-auth-sdk] DEPRECATION: sample deprecation');
    });
  });

  describe('getConsole', function() {
    it('returns actual console', function() {
      expect(util.getConsole()).toBe(window.console);
    });

    it('returns fake console if native console does not exist', function() {
      jest.spyOn(util, 'getNativeConsole').mockReturnValue(undefined);
      expect(util.getConsole().log).toBeDefined();
    });
  });

  describe('extend', function() {
    it('handles one argument', function() {
      var obj1 = {
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      };
      util.extend(obj1);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      }));
    });

    it('handles more than one argument', function() {
      var obj1 = {
        'prop1': 'test prop1',
        'prop2': 'test prop2'
      };
      var obj2 = {
        'prop3': 'test prop3'
      };
      var obj3 = {
        'prop1': 'test prop4'
      };
      util.extend(obj1, obj2, obj3);
      expect(obj1).toEqual(expect.objectContaining({
        'prop1': 'test prop4',
        'prop2': 'test prop2',
        'prop3': 'test prop3'
      }));
    });
  });

  describe('isIE11OrLess', function() {
    it('returns false when document doesnot have documentMode', function() {
      expect(document.documentMode).toBeUndefined();
      expect(util.isIE11OrLess()).toBe(false);
    });

    it('returns true documentMode is 11', function() {
      document.documentMode = 11;
      expect(util.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 10', function() {
      document.documentMode = 10;
      expect(util.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 9', function() {
      document.documentMode = 9;
      expect(util.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 8', function() {
      document.documentMode = 8;
      expect(util.isIE11OrLess()).toBe(true);
    });
  });

  describe('removeTrailingSlash', function() {
    it('returns a url with a trailing slash without the trailing slash', function() {
      var url = 'https://domain.com/';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash as is', function() {
      var url = 'https://domain.com';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url with a trailing slash and appended whitespace correctly', function() {
      var url = 'https://domain.com/    ';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url with a trailing slash and prepended whitespace correctly', function() {
      var url = '   https://domain.com/';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash and appended whitespace correctly', function() {
      var url = 'https://domain.com    ';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });

    it('returns a url without a trailing slash and prepended whitespace correctly', function() {
      var url = '   https://domain.com';
      expect(util.removeTrailingSlash(url)).toEqual('https://domain.com');
    });
  });

});
