var Cookies  = require('../../lib/browser/browserStorage').storage;
var JsCookie = require('js-cookie');

describe('cookie', function () {
  beforeEach(function () {
    jest.spyOn(JsCookie, 'get');
    jest.spyOn(JsCookie, 'set');
    jest.spyOn(JsCookie, 'remove');
  });

  describe('set',  function ()  {
    it('proxies JsCookie.set',  function ()  {
      Cookies.set('foo', 'bar');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });

    it('proxies JsCookie.set with an expiry time',  function ()  {
      Cookies.set('foo', 'bar', '2200-01-01T00:00:00.000Z');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        expires: new Date('2200-01-01T00:00:00.000Z')
      });
    });

    it('proxies JsCookie.set with an invalid expiry time',  function ()  {
      Cookies.set('foo', 'bar', 'not a valid date');
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/'
      });
    });
  });

  describe('get',  function ()  {
    it('proxies JsCookie.get',  function ()  {
      Cookies.get('foo');
      expect(JsCookie.get).toHaveBeenCalledWith('foo');
    });
  });

  describe('delete',  function ()  {
    it('proxies JsCookie.remove',  function ()  {
      Cookies.delete('foo');
      expect(JsCookie.remove).toHaveBeenCalledWith('foo', { path: '/' });
    });
  });
});
