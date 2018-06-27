var Cookies  = require('../../lib/cookies');
var JsCookie = require('js-cookie');

describe('cookie', function () {
  beforeEach(function () {
    spyOn(JsCookie, 'get');
    spyOn(JsCookie, 'set');
    spyOn(JsCookie, 'remove');
  });

  describe('setCookie',  function ()  {
    it('proxies JsCookie.set',  function ()  {
      Cookies.setCookie('foo', 'bar');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        expires: new Date('2038-01-19T03:14:07.000Z'),
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
      Cookies.deleteCookie('foo', { bar: 'baz' });
      expect(JsCookie.remove).toHaveBeenCalledWith('foo', { bar: 'baz' });
    });
  });
});
