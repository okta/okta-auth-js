var Cookies  = require('../../lib/cookies');
var JsCookie = require('js-cookie');

describe('cookie', function () {
  beforeEach(function () {
    jest.spyOn(JsCookie, 'get');
    jest.spyOn(JsCookie, 'set');
    jest.spyOn(JsCookie, 'remove');
  });

  describe('setCookie',  function ()  {
    it('proxies JsCookie.set',  function ()  {
      Cookies.setCookie('foo', 'bar');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });

    it('proxies JsCookie.set with an expiry time',  function ()  {
      Cookies.setCookie('foo', 'bar', '2038-01-19T03:14:07.000Z');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        expires: new Date('2038-01-19T03:14:07.000Z')
      });
    });

    it('proxies JsCookie.set with an invalid expiry time',  function ()  {
      Cookies.setCookie('foo', 'bar', 'not a valid date');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });
  });

  describe('getCookie',  function ()  {
    it('proxies Cookie.getCookie',  function ()  {
      Cookies.getCookie('foo');
      expect(JsCookie.get).toHaveBeenCalledWith('foo');
    });
  });

  describe('deleteCookie',  function ()  {
    it('proxies JsCookie.remove',  function ()  {
      Cookies.deleteCookie('foo');
      expect(JsCookie.remove).toHaveBeenCalledWith('foo', { path: '/' });
    });
  });
});
