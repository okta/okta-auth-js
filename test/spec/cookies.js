var Cookies  = require('../../lib/cookies');
var hardtack = require('hardtack');

describe('cookie', function () {
  beforeEach(function () {
    jest.spyOn(hardtack, 'get');
    jest.spyOn(hardtack, 'set');
    jest.spyOn(hardtack, 'remove');
  });

  describe('setCookie',  function ()  {
    it('proxies JsCookie.set',  function ()  {
      Cookies.setCookie('foo', 'bar');
      expect(hardtack.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });

    it('proxies JsCookie.set with an expiry time',  function ()  {
      Cookies.setCookie('foo', 'bar', '2038-01-19T03:14:07.000Z');
      expect(hardtack.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        expires: new Date('2038-01-19T03:14:07.000Z').toUTCString()
      });
    });

    it('proxies JsCookie.set with an invalid expiry time',  function ()  {
      Cookies.setCookie('foo', 'bar', 'not a valid date');
      expect(hardtack.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });
  });

  describe('getCookie',  function ()  {
    it('proxies Cookie.getCookie',  function ()  {
      Cookies.getCookie('foo');
      expect(hardtack.get).toHaveBeenCalledWith('foo');
    });
  });

  describe('deleteCookie',  function ()  {
    it('proxies JsCookie.remove',  function ()  {
      Cookies.deleteCookie('foo');
      expect(hardtack.remove).toHaveBeenCalledWith('foo', { path: '/' });
    });
  });
});
