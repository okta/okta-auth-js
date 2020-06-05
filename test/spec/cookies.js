import browserStorage from '../../lib/browser/browserStorage';
const Cookies = browserStorage.storage;

import JsCookie from 'js-cookie';

describe('cookie', function () {
  beforeEach(function () {
    jest.spyOn(JsCookie, 'get');
    jest.spyOn(JsCookie, 'set');
    jest.spyOn(JsCookie, 'remove');
  });

  describe('set',  function ()  {
    it('Throws if "secure" option is not set', () => {
      function testFunc() { Cookies.set('foo', 'bar', null, { sameSite: 'strict' }); }
      expect(testFunc).toThrow('storage.set: "secure" and "sameSite" options must be provided');
    });
    it('proxies JsCookie.set',  function ()  {
      Cookies.set('foo', 'bar', null, { secure: true, sameSite: 'strict' });
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        secure: true,
        sameSite: 'strict'
      });
    });

    it('proxies JsCookie.set with an expiry time',  function ()  {
      Cookies.set('foo', 'bar', '2200-01-01T00:00:00.000Z', { secure: true, sameSite: 'strict' });
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        expires: new Date('2200-01-01T00:00:00.000Z'),
        secure: true,
        sameSite: 'strict'
      });
    });

    it('proxies JsCookie.set with an invalid expiry time',  function ()  {
      Cookies.set('foo', 'bar', 'not a valid date', { secure: true, sameSite: 'strict' });
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        secure: true,
        sameSite: 'strict'
      });
    });

    it('proxies JsCookie.set with "secure" setting',  function ()  {
      Cookies.set('foo', 'bar', null, {
        secure: false,
        sameSite: 'strict'
      });
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        secure: false,
        sameSite: 'strict'
      });
    });

    it('proxies JsCookie.set with "sameSite" setting',  function ()  {
      Cookies.set('foo', 'bar', null, {
        secure: true,
        sameSite: 'lax'
      });
      expect(JsCookie.set).toHaveBeenCalledWith('foo', 'bar', {
        path: '/',
        secure: true,
        sameSite: 'lax'
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
