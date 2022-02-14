// eslint-disable-next-line node/no-extraneous-import
import { jest } from '@jest/globals';
import Cookies from 'js-cookie';
import Emitter from 'tiny-emitter';
import PCancelable from 'p-cancelable';
import { OktaAuth } from '@okta/okta-auth-js';
import NodeCache from 'node-cache';

describe('OktaAuth (api)', function() {
  let auth;
  let issuer;

  beforeEach(function() {
    issuer =  'http://my-okta-domain';
    auth = new OktaAuth({ issuer, pkce: false });
  });

  it('is a valid constructor', function() {
    expect(auth instanceof OktaAuth).toBe(true);
    expect(auth.emitter).toBeInstanceOf(Emitter);
  });

  it('can updateAuthState', () => {
    auth.authStateManager.updateAuthState();
    expect(auth.authStateManager._pending.updateAuthStatePromise).toBeInstanceOf(PCancelable);
  });

  describe('Storage', () => {
    describe('browser bundle - uses js-cookie', () => {
      if (process.env.BUNDLE_ENV !== 'browser') {
        return;
      }

      it('get', () => {
        jest.spyOn(Cookies, 'get');
        auth.options.storageUtil.storage.get();
        expect(Cookies.get).toHaveBeenCalled();
        
      });
      it('set', () => {
        jest.spyOn(Cookies, 'set');
        auth.options.storageUtil.storage.set('fakekey', 'fakevalue', '1644877195617', { secure: true, sameSite: 'none' });
        expect(Cookies.set).toHaveBeenCalledWith('fakekey', 'fakevalue', { 
          path: '/', 
          sameSite: 'none', 
          secure: true 
        });
      });
      it('delete', () => {
        jest.spyOn(Cookies, 'remove');
        auth.options.storageUtil.storage.delete('fakekey');
        expect(Cookies.remove).toHaveBeenCalledWith('fakekey', { path: '/' });
      });
    });

    describe('node bundle - uses node-cache', () => {
      if (process.env.BUNDLE_ENV !== 'node') {
        return;
      }

      it('use node-cache as storage', () => {
        expect(auth.options.storageUtil.nodeCache).toBeInstanceOf(NodeCache);
      });

      it('get', () => {
        jest.spyOn(auth.options.storageUtil.nodeCache, 'get');
        auth.options.storageUtil.storage.get('fakekey');
        expect(auth.options.storageUtil.nodeCache.get).toHaveBeenCalled();
      });
      it('set', () => {
        jest.spyOn(auth.options.storageUtil.nodeCache, 'set');
        auth.options.storageUtil.storage.set('fakekey', 'fakevalue', '1644877195617');
        expect(auth.options.storageUtil.nodeCache.set).toHaveBeenCalled();
      });
      it('delete', () => {
        jest.spyOn(auth.options.storageUtil.nodeCache, 'del');
        auth.options.storageUtil.storage.delete('fakekey');
        expect(auth.options.storageUtil.nodeCache.del).toHaveBeenCalled();
      });
    });

  });

});